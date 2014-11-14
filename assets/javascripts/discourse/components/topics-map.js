// Discourse.DisplayMapIsDoubleClicked = false;
// Discourse.LastSelectedLatLng = {};

Discourse.TopicsMapComponent = Ember.Component.extend({
  // classNameBindings: ['mapsClass'],
  // mapsClass: function() {
  //   debugger;
  //   return 'tall-maps';
  // }.property(),

  // isCenteredBinding: 'controller.activePost',
  infoWindows: [],
  // below highlights the marker for a given posts location
  // activePost will change when 'show .. on map' button for post is clicked
  onActivePostChange: function() {
    var activePost = this.get('activePost');
    if (!this.get('activePost.location')) {
      debugger;
      return;
    }
    if (this.get('activePost.post_number') === 1) {
      var icon = this.topic_icon;
      // var userName = activePost.topic.get('posters.firstObject.user.username') || activePost.topic.get('details.created_by.username');
      var title = activePost.topic.get('title') + "( " + activePost.location.title + " )";
      var dataObject = activePost.topic;
      var dataObjectType = 'topic';
      var myLatlng = new google.maps.LatLng(activePost.location.latitude, activePost.location.longitude);
      // if topic location has just been changed, object will have formattedAddress instead of addrees
      // TODO - make address everywhere
      var address = activePost.location.address || activePost.location.formattedAddress;
    } else {
      var icon = this.post_icon;
      // var userName = activePost.name;
      var title = activePost.location.title;
      var dataObject = activePost;
      var dataObjectType = 'post';
      var myLatlng = new google.maps.LatLng(activePost.location.latitude, activePost.location.longitude);
      var address = activePost.location.address;
    }
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: this.map,
      title: title,
      icon: icon
        // address: value.title
    });

    this.map.setCenter(myLatlng);
    this.map.setZoom(15);


    var contentString = '<div id="tmap-infowindow-content" >' +
      '<h4 class="infowindow-heading">' + title +
      '</h4>' +
      '<p class="infowindow-address">' + address +
      '</p>' +
      '<div id="bodyContent">' +
      // '<small>By: ' + userName + '</small>' +
      '</div>' +
      '</div>';

    var infowindowInstance = new google.maps.InfoWindow({
      content: contentString,
      dataObject: dataObject,
      dataObjectType: dataObjectType

    });


    for (var i = 0; i < this.infoWindows.length; i++) {
      this.infoWindows[i].close();
    }
    this.infoWindows = [];
    this.infoWindows.push(infowindowInstance);
    infowindowInstance.open(this.map, marker);


    var that = this;
    google.maps.event.addListener(infowindowInstance, 'domready', function() {
      document.getElementById("tmap-infowindow-content").addEventListener("click", function(event) {
        event.stopPropagation();
        that.locationPostSelected(event, infowindowInstance.dataObject);
      });
    });

    google.maps.event.addListener(marker, 'click', function(event) {
      that.locationPostSelected(event, infowindowInstance.dataObject);
    });


    //do your thing
  }.observes('activePost'),


  doubleClicked: false,
  clickEvent: null,

  // in the case of index map, markerValues are the markers property on the map controller passed in through the component declaration
  // in the case of topic map, markerValues are the markers property on the map controller passed in through the component declaration
  markerValuesChanged: function() {
    // for re-rendering as I browse
    this.triggerMapAsNeeded();
  }.observes('markerValues', 'geo'),
  // TODO - check if below is redundant
  markerAdded: function() {
    // for re-rendering as I browse
    this.triggerMapAsNeeded();
  }.observes('markerValues.length'),
  // hasMarkers: function() {
  //   if(this.get('markers') && this.get('markers').length > 0){
  //     return true;
  //   }
  //   else{
  //     return false;
  //   }
  // }.property('markers'),

  didInsertElement: function() {
    this._super();
    this.triggerMapAsNeeded();
  },

  triggerMapAsNeeded: function() {
    if (typeof google === "undefined") {
      var self = this;
      window.map_callback = function() {
        self.renderMap();
      }
      $.getScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=map_callback&libraries=places');
    } else {
      this.renderMap();
    }

  },

  geoDetails: function() {
    // used to decide center of map if there are no markers
    // TODO - this will have to change to support more scenarios
    // like countries, regions etc
    // ---- once I confirm that geo exists in all cases, will replace geoDetails directly with geo...
    if (this.get('geo')) {
      return this.get('geo');
    } else {
      // should not get here
      debugger;
      // var currentCity = this.currentCity || Discourse.SiteSettings.maptopic.defaultCityName;
      // var cityObject = Discourse.SiteSettings.maptopic.citySelectionItems.findBy('value', currentCity);
      // return cityObject;
    }
  }.property('currentCity', 'geo'),

  renderMap: function() {
    var currentMarkerValues = this.get('markerValues');
    var markersFound = currentMarkerValues && currentMarkerValues.length > 0;
    // if (markersFound && !_mobile_device_) {
    // might need to reintroduce logic of detecting _mobile_device_
    // this.renderMap(currentMarkerValues);

    if (markersFound) {
      this.renderMapWithMarkers();
    } else {
      this.renderMapWithoutMarkers();
      // "40.4167754", "-3.7037902");
      // longitude: "-3.7037902",
      // # latitude: "40.4167754)
    }
  },

  // highlighted_icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  topic_icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  post_icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",

  displaySearchBox: function() {
    if (this.get('showSearchBox')) {
      if (!$('#tmap-pac-input')[0]) {
        var searchBoxTagString = '<input id="tmap-pac-input" class="controls" type="text" ' +
          'placeholder="Double-click map or type place name here" >';
        $('body').append(searchBoxTagString);
      };
      var input = /** @type {HTMLInputElement} */ (
        document.getElementById('tmap-pac-input'));

      // var types = document.getElementById('type-selector');
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo('bounds', this.map);

      var that = this;
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        // infowindow.close();
        // marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
          return;
        }
        if (that.newLocationMarker) {
          that.newLocationMarker.setMap(null);
        }


        that.newLocationMarker = new google.maps.Marker({
          position: place.geometry.location,
          map: that.map,
          title: place.name
            // icon: icon
            // address: place.title
        });
        // if (that.searchResultMarkers) {
        //   $.each(that.searchResultMarkers, function(index, value) {
        //     value.setMap(null);
        //   });
        // };
        // that.searchResultMarkers = [];
        // that.searchResultMarkers.pushObject(marker);

        // var displayContext = this.get('displayContext');
        // if (displayContext === 'topicView') {
        //   var promptText = 'Select';
        // } else {
        //   var promptText = 'Start conversation';
        // }

        var contentString = '<div id="tmap-infowindow-content" style="padding: 5px;" >' +
          '<h4 id="firstHeading" class="firstHeading">' + place.name +
          '</h4>' +
          '<form id="tmap-search-result-form">' +
          '<div id="bodyContent">' +
          '<small>' + place.vicinity + '</small>' +
          '</div>' +
          '<button class="btn btn-primary btn-small" style="margin-bottom:5px" type="submit">' +
          'Select</button>' +
          '</form>' +
          '</div>';

        var infowindowInstance = new google.maps.InfoWindow({
          content: contentString,
          searchResult: place
        });
        infowindowInstance.open(that.map, that.newLocationMarker);

        that.map.setCenter(place.geometry.location);
        google.maps.event.addListenerOnce(that.map, 'bounds_changed', function(event) {
          if (this.getZoom() > 15) {
            this.setZoom(15);
          }
        });

        google.maps.event.addListener(infowindowInstance, 'domready', function() {
          document.getElementById("tmap-search-result-form").addEventListener("submit", function(e) {
            e.preventDefault();
            // startLocationTopic method in map_controller:
            // addPlaceFromSearchResult in topic_controller
            that.sendAction('searchClickedAction', infowindowInstance.searchResult, that.get('geoDetails'));
          });
        });

      });



    }
  },

  // below ensures that after infoWindow is shown, showingInfoWindow is set
  // so a second click knows to do something else - like redirect to topic...
  showNewInfowindow: function(infowindowInstance, marker) {
    if (this.newLocationMarker) {
      this.newLocationMarker.setMap(null);
    }
    for (var i = 0; i < this.infoWindows.length; i++) {
      this.infoWindows[i].close();
    }
    this.infoWindows = [];
    this.infoWindows.push(infowindowInstance);
    infowindowInstance.open(this.map, marker);
    window.setTimeout(function() {
      marker.showingInfoWindow = true;
    }, 1000);
  },

  // having min and maxZoom can lead to a shitty experience if someone really wants to add something outside a city
  // in 2 minds about it..
  mapOptions: {
    // maxZoom: 20,
    // minZoom: 9,
    zoom: 15,
    // center: mapCenter,
    // mapTypeId: google.maps.MapTypeId.ROADMAP
    styles: [{
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    }]
  },

  renderMapWithoutMarkers: function() {
    var geoDetails = this.get('geoDetails');
    var mapCenter = new google.maps.LatLng(geoDetails.latitude, geoDetails.longitude);


    this.mapOptions.center = mapCenter;
    this.mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;

    this.map = new google.maps.Map(document.getElementById(
        'topics-map-canvas'),
      this.mapOptions);

    var that = this;
    google.maps.event.addListener(this.map, 'click', function(event) {
      that.mapClicked(event.latLng.lat(), event.latLng.lng());
    });

    if (geoDetails && geoDetails.geometry && geoDetails.geometry.bounds) {
      var bounds = new google.maps.LatLngBounds();
      // seach for "world" - it has geometry but no bounds....
      var neLatlng = new google.maps.LatLng(geoDetails.geometry.bounds.northeast.lat, geoDetails.geometry.bounds.northeast.lng);
      var swLatlng = new google.maps.LatLng(geoDetails.geometry.bounds.southwest.lat, geoDetails.geometry.bounds.southwest.lng);
      bounds.extend(neLatlng);
      bounds.extend(swLatlng);
      this.map.fitBounds(bounds);
      // this.map.setZoom(this.map.getZoom() + 1);
    };


    this.displaySearchBox();
  },

  renderMapWithMarkers: function() {
    var displayContext = this.get('displayContext');
    var currentMarkerValues = this.get('markerValues');
    // var mapCenter = new google.maps.LatLng(currentMarkerValues[0].latitude,
    //   currentMarkerValues[0].longitude);
    var geoDetails = this.get('geoDetails');

    var mapCenter = new google.maps.LatLng(geoDetails.latitude, geoDetails.longitude);
    this.mapOptions.center = mapCenter;
    this.mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
    this.map = new google.maps.Map(document.getElementById(
        'topics-map-canvas'),
      this.mapOptions);

    // below makes the map available outside this component
    // this is useful when I need to do google place searches - eg in place_manager modal
    // perhaps will get rid of this.map and always use geo.map...
    this.set('geo.map', this.map);

    var bounds = new google.maps.LatLngBounds();
    // TODO - ensure I have unique markers where location is same
    this.infoWindows = [];
    this.markers = [];
    var that = this;
    $.each(currentMarkerValues, function(index, detailsForMarker) {
      // debugger;
      var addressString = "";
      if (displayContext === 'topicView') {
        // debugger;
        // using topic icon everywhere till I figure out a decent scheme...
        var icon = that.topic_icon;
        addressString = detailsForMarker.location.address;
        var title = detailsForMarker.location.title;
        var dataObject = detailsForMarker.posts;
        var dataObjectType = 'post';
      } else if (displayContext === 'indexView') {
        var icon = that.topic_icon;
        // var userName = detailsForMarker.topic.get('posters.firstObject.user.username') || detailsForMarker.topic.get('details.created_by.username');
        var title = detailsForMarker.topic.title;
        // .get('title') + "( " + detailsForMarker.location.title + " )";
        addressString = detailsForMarker.location.title +
          '<button class="btn btn-infowindow btn-primary btn-small" style="margin-bottom:5px" >' +
          '<i class="fa fa-comment-o" aria-hidden="true"></i>' +
          'Go to conversation</button></div>';
        // '<br><small>click for more...</small>';
        var dataObject = detailsForMarker.topic;
        var dataObjectType = 'topic';
      } else {
        var icon = that.topic_icon;
        var userName = "no one";
        var title = detailsForMarker.location.title;
        // return;
      };


      var myLatlng = new google.maps.LatLng(detailsForMarker.location.latitude, detailsForMarker.location.longitude);
      // (52.519171, 13.4060912);
      // latlngbounds.extend(latLng);
      bounds.extend(myLatlng);
      var marker = new google.maps.Marker({
        position: myLatlng,
        map: that.map,
        title: title,
        icon: icon,
        showingInfoWindow: false
          // address: detailsForMarker.title
      });
      that.markers.pushObject(marker);

      // var addressString = "";
      // if (userName) {
      //   addressString = '<small>By: ' + userName + '</small>';
      // };
      var contentString = '<div id="tmap-infowindow-content" >' +
        '<h4 id="firstHeading" class="firstHeading">' + title +
        '</h4>' + '<a>' +
        '<div id="bodyContent">' +
        addressString +
        '</div></a>' +
        '</div>';

      var infowindowInstance = new google.maps.InfoWindow({
        content: contentString,
        dataObject: dataObject,
        dataObjectType: dataObjectType

      });

      // only reason I'm pusing into this array is so that I can get to infowindowInstance
      // in 'showOffInfo' method.
      that.infoWindows.pushObject(infowindowInstance);


      google.maps.event.addListener(marker, 'mouseover', function() {
        // debugger;
        that.showNewInfowindow(infowindowInstance, marker);
      });


      google.maps.event.addListener(marker, 'click', function(event) {
        // need to show infoWindow for 1st click as tablets do not trigger mouseover
        if (marker.showingInfoWindow) {
          that.placeSelected(event, detailsForMarker);
        } else {
          that.showNewInfowindow(infowindowInstance, marker);
        }
      });

      google.maps.event.addListener(infowindowInstance, 'domready', function() {
        // ensure document.getElementById("tmap-infowindow-content") exists....
        var infWin = document.getElementById("tmap-infowindow-content");
        if (infWin) {
          infWin.addEventListener("click", function(event) {
            event.stopPropagation();
            that.placeSelected(event, detailsForMarker);
          });
        } else {
          // debugger;
        };

      });

    });

    // for indexView, I will not fitBounds in case
    // if (displayContext === 'topicView') {
    if (this.get('markers.length') > 1) {
      this.map.fitBounds(bounds);
    } else {
      // if there is only one marker, set center to be that one
      // this.map.setZoom(zoom);
      // this.map.setCenter(mapCenter);
      // http://stackoverflow.com/questions/4523023/using-setzoom-after-using-fitbounds-with-google-maps-api-v3
      this.map.fitBounds(bounds);
      // seems silly but I really have to do all this to get the zoom looking half decent
      google.maps.event.addListenerOnce(this.map, 'bounds_changed', function(event) {
        if (this.getZoom() > 15) {
          this.setZoom(15);
        }
      });

    };
    // };
    google.maps.event.addListener(this.map, 'click', function(event) {
      that.mapClicked(event.latLng.lat(), event.latLng.lng());
    });
    this.displaySearchBox();
    google.maps.event.addListenerOnce(this.map, 'idle', function() {
      // below highlights a random infowindow:
      window.setTimeout(that.showOffInfo.bind(that), 3000);
    });
  },
  showOffInfo: function() {
    if (this.infoWindows.length > 0) {

      this.infoWindows[0].open(this.map, this.markers[0]);
    }
    // for (var i = 0; i < this.infoWindows.length; i++) {
    //   this.showNewInfowindow(this.infoWindows[i],this.markers[i])
    // }

  },
  mapClicked: function(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    var geocoder = new google.maps.Geocoder();
    var that = this;

    geocoder.geocode({
      'latLng': latlng
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          if (that.newLocationMarker) {
            that.newLocationMarker.setMap(null);
          }
          that.newLocationMarker = new google.maps.Marker({
            position: latlng,
            map: that.map
          });

          var talkPrompt = "Select";
          // var talkPrompt = "start conversation";
          // if (that.get('displayContext') === 'topicView') {
          //   talkPrompt = "write about this place";
          // }

          var contentString = '<div id="map-clickedlocation-content" >' +
            '<h4>' +
            results[0].formatted_address +
            '</h4>' +
            '<div id="clickedlocation-div">' +
            // '<div id="clickedlocation-name-prompt" class="warning">Enter location name to ' +
            // talkPrompt + ':</div>' +
            // '<input id="clickedlocation-name" type="text" /><br>' +
            '<button class="btn btn-infowindow btn-primary btn-small" style="margin-bottom:5px" >' +
            talkPrompt + '</button></div>' +
            '</div>';

          infowindowForClickedLocation = new google.maps.InfoWindow({
            content: contentString
          });
          // infowindowForClickedLocation.setContent(results[0].formatted_address);
          infowindowForClickedLocation.open(that.map, that.newLocationMarker);

          // if (that.infoWindows) {
          for (var i = 0; i < that.infoWindows.length; i++) {
            that.infoWindows[i].close();
          }
          // }
          that.infoWindows = [];
          that.infoWindows.push(infowindowForClickedLocation);


          google.maps.event.addListener(infowindowForClickedLocation, 'domready', function() {
            // document.getElementById("clickedlocation-form").addEventListener("submit", function(e) {

            // e.preventDefault(); for submit etc
            document.getElementById("map-clickedlocation-content").addEventListener("click", function(e) {
              e.stopPropagation(); // for click events
              // e.preventDefault(); for submit etc
              // var locationName = e.target.elements['clickedlocation-name'].value;
              var geo = that.get('geoDetails');
              var locationInfo = {
                'clickedLocation': results[0],
                map: that.map,
                geo: geo
              }

              // clear that.newLocationMarker;
              that.newLocationMarker.setMap(null);
              // for map in topic, below is showExplorerModalForTopic in topic controller
              that.sendAction('mapClickedAction', locationInfo);

            });
          });


          // that.sendAction('mapClickedAction', latlng, results[0]);

        } else {
          alert("No results found");
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });

    // this.get("controller").addEvent(lat, lng);
  },
  placeSelected: function(event, placeDetails) {
    // will call showPlaceDetails in topic_controller
    placeDetails.map = this.map;
    this.sendAction('markerSelectedAction', placeDetails);
  },


});
