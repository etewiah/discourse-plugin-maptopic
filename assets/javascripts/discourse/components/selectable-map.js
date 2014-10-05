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
  cityForMap: "",
  countryForMap: "",
  stringToSearch: "",
  infoWindows: [],

  readyToSelect: function() {
    if (this.get('locationObject.title')) {
      return true;
    } else {
      return false;
    }
  }.property('locationObject.title'),
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
  },

  displayMapIfNeeded: function() {
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
  },

  initiateMaps: function() {
    // var currentMarkerValues = this.get('markers');
    if (this.get('defaultLocation.city')) {
      this.set('cityForMap', this.get('defaultLocation.city'));
    }
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


    this.markers = [];
    if (defaultLocation.title) {
      // means location had been previously selected so mark it
      // TODO - add infowindow
      var marker = new google.maps.Marker({
        position: mapCenter,
        map: this.map
      });
      this.markers.pushObject(marker);
    }

    var that = this;
    // debugger;
    google.maps.event.addListener(this.map, 'click', function(event) {
      that.locationSelected(event.latLng.lat(), event.latLng.lng());
    });

    // add google autocomplete box

    var input = /** @type {HTMLInputElement} */ (
      document.getElementById('pac-input'));

    // var types = document.getElementById('type-selector');
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', this.map);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      // infowindow.close();
      // marker.setVisible(false);
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        return;
      }

      var marker = new google.maps.Marker({
        position: place.geometry.location,
        map: that.map,
        title: place.name
        // icon: icon
        // address: place.title
      });
      if (that.markers) {
        $.each(that.markers, function(index, value) {
          value.setMap(null);
        });
      };
      that.markers.pushObject(marker);
      var contentString = '<div id="smap-infowindow-content" >' +
        '<a>' +
        '<h4 id="firstHeading" class="firstHeading">' + place.name +
        '</h4>' +
        '<div id="bodyContent">' +
        '<small>' + place.vicinity + '</small>' +
        // '<button class="btn btn-primary btn-small" style="margin-bottom:5px" type="submit">' +
        // 'Use</button></form>' +
        '</div></a>' +
        '</div>';

      var infowindowInstance = new google.maps.InfoWindow({
        content: contentString,
        searchResult: place
      });
      infowindowInstance.open(that.map, marker);

      var locationObject = Discourse.Location.locationFromPlaceSearch(place, that.cityForMap);
      debugger;

      that.set('locationObject', locationObject);
      that.map.setCenter(place.geometry.location);
      google.maps.event.addListenerOnce(that.map, 'bounds_changed', function(event) {
        if (this.getZoom() > 15) {
          this.setZoom(15);
        }
      });

      // google.maps.event.addListener(marker, 'mouseover', function() {
      //   for (var i = 0; i < that.infoWindows.length; i++) {
      //     that.infoWindows[i].close();
      //   }
      //   that.infoWindows = [];
      //   that.infoWindows.push(infowindowInstance);
      //   infowindowInstance.open(that.map, marker);
      // });
      // google.maps.event.addListener(marker, 'click', function() {
      //   var locationObject = Discourse.Location.locationFromPlaceSearch(
      //     infowindowInstance.searchResult, that.cityForMap);
      //   that.set('locationObject', locationObject);
      // });

      // google.maps.event.addListener(infowindowInstance, 'domready', function() {
      //   document.getElementById("smap-infowindow-content").addEventListener("click", function(e) {
      //     e.stopPropagation();
      //     //action is locationFinalezed in sel loc modal ctrlr
      //     // that.sendAction('infowindowAction', infowindowInstance.searchResult, that.cityForMap);
      //     var locationObject = Discourse.Location.locationFromPlaceSearch(
      //       infowindowInstance.searchResult, that.cityForMap);
      //     that.set('locationObject', locationObject);
      //   });
      // });
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
          // if (that.marker) {
          //   // if a marker has previously been set, clear it
          //   that.marker.setMap(null);
          // }
          if (that.markers) {
            $.each(that.markers, function(index, value) {
              value.setMap(null);
            });
          };
          that.markers = [];
          var marker = new google.maps.Marker({
            position: latlng,
            map: that.map
          });
          that.markers.pushObject(marker);
          var infowindowInstance = new google.maps.InfoWindow({
            // content: contentString
          });
          infowindowInstance.setContent(results[0].formatted_address);

          for (var i = 0; i < that.infoWindows.length; i++) {
            that.infoWindows[i].close();
          }
          that.infoWindows = [];
          that.infoWindows.push(infowindowInstance);
          infowindowInstance.open(that.map, marker);


          // that.infowindow.open(that.map, that.marker);
          var locationObject = Discourse.Location.locationFromGmap(results[0]);
          that.set('locationObject', locationObject);

          // def action is locationSelected in sel loc modal ctrlr
          // that.sendAction('action', latlng, results[0]);

        } else {
          // alert("No results found");
        }
      } else {
        // alert("Geocoder failed due to: " + status);
      }
    });

    // this.get("controller").addEvent(lat, lng);
  },
  actions: {
    addLocationToTopic: function() {
      if (Ember.isEmpty(this.get('locationObject.title'))) {
        return;
      };
      this.sendAction('locationAddedAction', this.get('locationObject'));
    },
    unsetLocationobject: function() {
      this.set('locationObject', null);
    }
  },
  // searchForAddress: function() {
  //   if (Ember.isBlank(this.stringToSearch)) {
  //     return;
  //   };
  //   debugger;
  // },
  // searchForLocation: function() {
  //   if (Ember.isBlank(this.stringToSearch)) {
  //     return;
  //   };
  //   var searchRequest = {
  //     location: this.map.center,
  //     radius: '10000',
  //     keyword: this.stringToSearch
  //     // types: ['store']
  //   };
  //   this.execPlaceSearch(searchRequest);
  // },
  // to take out - no longer used:
  execPlaceSearch: function(searchRequest) {
    var that = this;
    service = new google.maps.places.PlacesService(this.map);
    service.nearbySearch(searchRequest, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        var bounds = new google.maps.LatLngBounds();

        if (that.marker) {
          // if a marker has previously been set, clear it
          that.marker.setMap(null);
        };
        if (that.markers) {
          $.each(that.markers, function(index, value) {
            value.setMap(null);
          });
        };
        that.markers = [];
        results.forEach(function(value, index) {
          // var marker = new google.maps.Marker({
          //   position: value.geometry.location,
          //   map: that.map,
          //   title: value.name
          //   // icon: icon
          //   // address: value.title
          // });
          // that.markers.pushObject(marker);
          // var contentString = '<div id="smap-infowindow-content" >' +
          //   '<a>' +
          //   '<h4 id="firstHeading" class="firstHeading">' + value.name +
          //   '</h4>' +
          //   '<div id="bodyContent">' +
          //   '<small>' + value.vicinity + '</small>' +
          //   // '<button class="btn btn-primary btn-small" style="margin-bottom:5px" type="submit">' +
          //   // 'Use</button></form>' +
          //   '</div></a>' +
          //   '</div>';

          // var infowindowInstance = new google.maps.InfoWindow({
          //   content: contentString,
          //   searchResult: value
          // });
          // google.maps.event.addListener(marker, 'mouseover', function() {
          //   for (var i = 0; i < that.infoWindows.length; i++) {
          //     that.infoWindows[i].close();
          //   }
          //   that.infoWindows = [];
          //   that.infoWindows.push(infowindowInstance);
          //   infowindowInstance.open(that.map, marker);
          // });
          // google.maps.event.addListener(marker, 'click', function() {
          //   var locationObject = Discourse.Location.locationFromPlaceSearch(
          //     infowindowInstance.searchResult, that.cityForMap);
          //   that.set('locationObject', locationObject);
          // });

          // google.maps.event.addListener(infowindowInstance, 'domready', function() {
          //   document.getElementById("smap-infowindow-content").addEventListener("click", function(e) {
          //     e.stopPropagation();
          //     //action is locationFinalezed in sel loc modal ctrlr
          //     // that.sendAction('infowindowAction', infowindowInstance.searchResult, that.cityForMap);
          //     var locationObject = Discourse.Location.locationFromPlaceSearch(
          //       infowindowInstance.searchResult, that.cityForMap);
          //     that.set('locationObject', locationObject);
          //   });
          // });
          bounds.extend(value.geometry.location);
        })
        if (that.get('markers.length') > 1) {
          that.map.fitBounds(bounds);
        } else {
          // http://stackoverflow.com/questions/4523023/using-setzoom-after-using-fitbounds-with-google-maps-api-v3
          that.map.fitBounds(bounds);
          // seems silly but I really have to do all that to get the zoom looking half decent
          google.maps.event.addListenerOnce(that.map, 'bounds_changed', function(event) {
            if (this.getZoom() > 15) {
              this.setZoom(15);
            }
          });
        }

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
          $.each(cityObject.address_components, function(i, address_component) {
            if (address_component.types[0] == "locality") {
              // city = address_component.long_name;
              that.set('cityForMap', address_component.long_name.toLowerCase());
            }
            if (address_component.types[0] == "country") {
              that.set('countryForMap', address_component.long_name.toLowerCase());
            }
          });
          // that.set('cityForMap', city);
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
