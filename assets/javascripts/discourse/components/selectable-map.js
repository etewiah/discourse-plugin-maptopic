Discourse.SelectableMapIsDoubleClicked = false;
Discourse.LastSelectedLatLng = {};

Discourse.SelectableMapComponent = Ember.Component.extend({

  _setup: function() {
    // allows  submission by pressing 'ENTER' 
    // var selectLocationController = this.get('controller');
    var that = this;
    // debugger;
    Em.run.schedule('afterRender', function() {
      // $("input[type='text'], input[type='password']").keydown(function(e) {
      $("#map-city-name,#place-to-search").keydown(function(e) {
        if (e.keyCode === 13 && e.target.id === "place-to-search") {
          that.send('searchForLocation');
        } else if (e.keyCode === 13 && e.target.id === "map-city-name") {
          that.send('changeCity');
        }

      });
    });
  }.on('didInsertElement'),
  cityToFind: "",
  stringToSearch: "",
  infoWindows: [],

  // http://stackoverflow.com/questions/17075269/google-maps-load-api-script-and-initialize-inside-ember-js-view

  doubleClicked: false,
  clickEvent: null,

  // markersChanged: function() {
  //     // for re-rendering as I browse
  //     this.displayMapIfNeeded();
  // }.observes('markers'),

  didInsertElement: function() {
    this._super();
    this.displayMapIfNeeded();
    // zoom = 8;
    // icon = {
    //   path: google.maps.SymbolPath.CIRCLE,
    //   scale: 20
    // }
  },

  displayMapIfNeeded: function() {
    // var currentMarkerValues = this.get('markers');
    // var markersFound = currentMarkerValues && currentMarkerValues.length > 0;

    // if (markersFound) {
    // this.initiateMaps(currentMarkerValues);
    if (typeof google === "undefined") {
      var self = this;
      window.map_callback = function() {
        self.initiateMaps();
      }
      $.getScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=map_callback&libraries=places');
    } else {
      this.initiateMaps();
    }
    // }
  },

  initiateMaps: function() {
    // var currentMarkerValues = this.get('markers');

    if (this.get('defaultLocation.latitude')) {
      var defaultLocation = this.get('defaultLocation');
    } else {
      debugger;
      // var defaultLocation = defaultCity;
    }
    var mapCenter = new google.maps.LatLng(defaultLocation.latitude,
      defaultLocation.longitude);


    var zoom = 15;
    var icon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

    var styles = [{
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    }];

    var mapOptions = {
      zoom: zoom,
      center: mapCenter,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styles
    };

    // debugger;
    this.map = new google.maps.Map(document.getElementById(
        'selectable-map-canvas'),
      mapOptions);

    var that = this;
    // debugger;
    google.maps.event.addListener(this.map, 'click', function(event) {
      that.locationSelected(event.latLng.lat(), event.latLng.lng());
    });


  },
  locationSelected: function(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    var geocoder = new google.maps.Geocoder();
    var that = this;

    geocoder.geocode({
      'latLng': latlng
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          // that.map.setZoom(11);
          if (that.marker) {
            // if a marker has previously been set, clear it
            that.marker.setMap(null);
          }
          that.marker = new google.maps.Marker({
            position: latlng,
            map: that.map
          });
          that.infowindow = new google.maps.InfoWindow({
            // content: contentString
          });
          that.infowindow.setContent(results[0].formatted_address);
          that.infowindow.open(that.map, that.marker);

          that.sendAction('action', latlng, results[0]);

        } else {
          // alert("No results found");
        }
      } else {
        // alert("Geocoder failed due to: " + status);
      }
    });

    // this.get("controller").addEvent(lat, lng);
  },
  searchForLocation: function() {
    if (Ember.isBlank(this.stringToSearch)) {
      return;
    };
    var request = {
      location: this.map.center,
      radius: '10000',
      keyword: this.stringToSearch
      // types: ['store']
    };
    var that = this;
    service = new google.maps.places.PlacesService(this.map);
    service.nearbySearch(request, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        results.forEach(function(value, index) {
          var marker = new google.maps.Marker({
            position: value.geometry.location,
            map: that.map,
            title: value.name
            // icon: icon
            // address: value.title
          });
          var contentString = '<div id="map-infowindow-content" >' +
            '<a>' +
            '<h4 id="firstHeading" class="firstHeading">' + value.name +
            '</h4>' +
            '<div id="bodyContent">' +
            '<small>' + value.vicinity + '</small>' +
            '</div></a>' +
            '</div>';

          var infowindowInstance = new google.maps.InfoWindow({
            content: contentString,
            searchResult: value
          });
          google.maps.event.addListener(marker, 'mouseover', function() {
            // setTimeout(function() {
            //   infowindowInstance.close();
            // }, 6000);
            for (var i = 0; i < that.infoWindows.length; i++) {
              that.infoWindows[i].close();
            }
            that.infoWindows = [];
            that.infoWindows.push(infowindowInstance);
            infowindowInstance.open(that.map, marker);
          });

          google.maps.event.addListener(infowindowInstance, 'domready', function() {
            document.getElementById("map-infowindow-content").addEventListener("click", function(e) {
              e.stopPropagation();
              debugger;
              if (infowindowInstance.dataObjectType === 'topic') {
                that.locationTopicSelected(e, infowindowInstance.dataObject);
              } else if (infowindowInstance.dataObjectType === 'post') {
                that.locationPostSelected(e, infowindowInstance.dataObject);
              }

            });
          });


        })
      }
    });

  },
  changeCity: function() {
    if (Ember.isBlank(this.cityToFind)) {
      return;
    };
    var geocoder = new google.maps.Geocoder();
    var that = this;

    geocoder.geocode({
      'address': this.cityToFind
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          var cityObject = results[0];
          that.map.setCenter(cityObject.geometry.location);
          // http://stackoverflow.com/questions/4523023/using-setzoom-after-using-fitbounds-with-google-maps-api-v3
          // this.map.fitBounds(bounds);
          // seems silly but I really have to do all this to get the zoom looking half decent
          google.maps.event.addListenerOnce(that.map, 'bounds_changed', function(event) {
            if (this.getZoom() > 15) {
              this.setZoom(15);
            }
          });
        }
      }
    });

  }
});
