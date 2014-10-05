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
      var userName = activePost.topic.get('posters.firstObject.user.username') || activePost.topic.get('details.created_by.username');
      var title = activePost.topic.get('title') + "( " + activePost.location.title + " )";
      var dataObject = activePost.topic;
      var dataObjectType = 'topic';
      var myLatlng = new google.maps.LatLng(activePost.location.latitude, activePost.location.longitude);
      // if topic location has just been changed, object will have formattedAddress instead of addrees
      // TODO - make address everywhere
      var address = activePost.location.address || activePost.location.formattedAddress;
    } else {
      var icon = this.post_icon;
      var userName = activePost.name;
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
      '<small>By: ' + userName + '</small>' +
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
  }.observes('markerValues', 'currentCity'),
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

  cityDetails: function() {
    var currentCity = this.currentCity || Discourse.SiteSettings.maptopic.defaultCityName;
    var cityObject = Discourse.SiteSettings.maptopic.citySelectionItems.findBy('value', currentCity);
    return cityObject;
  }.property('currentCity'),

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

  renderMapWithoutMarkers: function() {
    var cityDetails = this.get('cityDetails');
    var mapCenter = new google.maps.LatLng(cityDetails.latitude, cityDetails.longitude);
    // no longer need this as I will not display map where there are no markerValues...
    // if (currentMarkerValues && currentMarkerValues.length > 0) {
    //  mapCenter = new google.maps.LatLng(currentMarkerValues[0].latitude, currentMarkerValues[0].longitude);
    // } else {
    //  mapCenter = new google.maps.LatLng(Discourse.Constants.DEFAULT_CITY_DETAILS.lat, Discourse.Constants.DEFAULT_CITY_DETAILS.lon);
    // }

    var zoom = 15;

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

    this.map = new google.maps.Map(document.getElementById(
        'topics-map-canvas'),
      mapOptions);
    var that = this;
    google.maps.event.addListener(this.map, 'click', function(event) {
      that.mapClicked(event.latLng.lat(), event.latLng.lng());
    });

    this.displaySearchBox();
  },

  displaySearchBox: function() {
    if (this.get('showSearchBox')) {
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

            //   var contentString = '<div id="map-clickedlocation-content" >' +
            // '<h4>' +
            // results[0].formatted_address +
            // '</h4>' +
            // '<form id="clickedlocation-form">' +
            // '<div id="clickedlocation-name-prompt" class="warning">Enter location name to start talking:</div>' +
            // '<input id="clickedlocation-name" type="text" /><br>' +
            // '<button class="btn btn-primary btn-small" style="margin-bottom:5px" type="submit">' +
            // 'Start talking</button></form>' +
            // '</div>';

        var contentString = '<div id="tmap-infowindow-content" >' +
          '<h4 id="firstHeading" class="firstHeading">' + place.name +
          '</h4>' +
          '<form id="map-search-result-form">' +
          '<div id="bodyContent">' +
          '<small>' + place.vicinity + '</small>' +
          '</div>' +
          '<button class="btn btn-primary btn-small" style="margin-bottom:5px" type="submit">' +
          'Start talking</button>' +
          '</form>' +
          '</div>';

        var infowindowInstance = new google.maps.InfoWindow({
          content: contentString,
          searchResult: place
        });
        infowindowInstance.open(that.map, marker);

        // var locationObject = Discourse.Location.locationFromPlaceSearch(place, that.get('cityDetails.value'));
        // that.set('locationObject', locationObject);

        that.map.setCenter(place.geometry.location);
        google.maps.event.addListenerOnce(that.map, 'bounds_changed', function(event) {
          if (this.getZoom() > 15) {
            this.setZoom(15);
          }
        });

        google.maps.event.addListener(infowindowInstance, 'domready', function() {
          document.getElementById("tmap-infowindow-content").addEventListener("click", function(e) {
            e.stopPropagation();
            console.log(infowindowInstance);

            // debugger;
            that.sendAction('mapClickedAction', 'placeSearch', infowindowInstance.searchResult, that.get('cityDetails.value') );
            //action is locationFinalezed in sel loc modal ctrlr
            // that.sendAction('infowindowAction', infowindowInstance.searchResult, that.cityForMap);
            // var locationObject = Discourse.Location.locationFromPlaceSearch(
            //   infowindowInstance.searchResult, that.cityForMap);
            // that.set('locationObject', locationObject);
          });
        });

        // google.maps.event.addListener(infowindowForClickedLocation, 'domready', function() {
        //   document.getElementById("clickedlocation-form").addEventListener("submit", function(e) {
        //     // e.stopPropagation();
        //     e.preventDefault();
        //     var locationName = e.srcElement.elements['clickedlocation-name'].value;
        //     if (Ember.isBlank(locationName)) {
        //       // TODO - warn about empty name
        //       debugger;
        //     } else {
        //       // clear marker;
        //       marker.setMap(null);
        //       // that.locationInfoWindowSelected(results[0], locationName); city param is blank:
        //       that.sendAction('mapClickedAction', 'gmapLocation', results[0], '', locationName);
        //     }
        //   });
        // });


      });



    }
  },

  renderMapWithMarkers: function() {
    var currentMarkerValues = this.get('markerValues');
    var mapCenter = new google.maps.LatLng(currentMarkerValues[0].latitude,
      currentMarkerValues[0].longitude);
    // no longer need this as I will not display map where there are no markers...
    // if (currentMarkerValues && currentMarkerValues.length > 0) {
    //  mapCenter = new google.maps.LatLng(currentMarkerValues[0].latitude, currentMarkerValues[0].longitude);
    // } else {
    //  mapCenter = new google.maps.LatLng(Discourse.Constants.DEFAULT_CITY_DETAILS.lat, Discourse.Constants.DEFAULT_CITY_DETAILS.lon);
    // }

    var zoom = 15;

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

    this.map = new google.maps.Map(document.getElementById(
        'topics-map-canvas'),
      mapOptions);

    var bounds = new google.maps.LatLngBounds();
    // TODO - ensure I have unique markers where location is same

    this.infoWindows = [];
    this.markers = [];
    var that = this;
    $.each(currentMarkerValues, function(index, value) {
      if (value.post) {
        var icon = that.post_icon;
        var userName = value.post.name;
        var title = value.location.title;
        var dataObject = value.post;
        var dataObjectType = 'post';
      } else if (value.topic) {
        var icon = that.topic_icon;
        var userName = value.topic.get('posters.firstObject.user.username') || value.topic.get('details.created_by.username');
        var title = value.topic.get('title') + "( " + value.location.title + " )";
        var dataObject = value.topic;
        var dataObjectType = 'topic';
      } else {
        return;
      };


      var myLatlng = new google.maps.LatLng(value.location.latitude, value.location.longitude);
      // (52.519171, 13.4060912);
      // latlngbounds.extend(latLng);
      bounds.extend(myLatlng);
      var marker = new google.maps.Marker({
        position: myLatlng,
        map: that.map,
        title: title,
        icon: icon
        // address: value.title
      });
      that.markers.pushObject(marker);

      var contentString = '<div id="tmap-infowindow-content" >' +
        '<a>' +
        '<h4 id="firstHeading" class="firstHeading">' + title +
        '</h4>' +
        '<div id="bodyContent">' +
        '<small>By: ' + userName + '</small>' +
        '</div></a>' +
        '</div>';

      var infowindowInstance = new google.maps.InfoWindow({
        content: contentString,
        dataObject: dataObject,
        dataObjectType: dataObjectType

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


      google.maps.event.addListener(marker, 'click', function(event) {
        if (infowindowInstance.dataObjectType === 'topic') {
          that.locationTopicSelected(event, infowindowInstance.dataObject);
        } else if (infowindowInstance.dataObjectType === 'post') {
          that.locationPostSelected(event, infowindowInstance.dataObject);
        }
        // for (var i = 0; i < that.infoWindows.length; i++) {
        //   that.infoWindows[i].close();
        // }
        // that.infoWindows = [];
        // that.infoWindows.push(infowindowInstance);
        // infowindowInstance.open(that.map, marker);
      });

      google.maps.event.addListener(infowindowInstance, 'domready', function() {
        document.getElementById("tmap-infowindow-content").addEventListener("click", function(e) {
          e.stopPropagation();
          // console.log("hi!");
          if (infowindowInstance.dataObjectType === 'topic') {
            that.locationTopicSelected(e, infowindowInstance.dataObject);
          } else if (infowindowInstance.dataObjectType === 'post') {
            that.locationPostSelected(e, infowindowInstance.dataObject);
          }

        });
      });


    });

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
    }

    google.maps.event.addListener(this.map, 'click', function(event) {
      that.mapClicked(event.latLng.lat(), event.latLng.lng());
    });
    this.displaySearchBox();


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
          // if (marker) {
          //   marker.setMap(null);
          // }
          var marker = new google.maps.Marker({
            position: latlng,
            map: that.map
          });


          if (that.markers) {
            $.each(that.markers, function(index, value) {
              value.setMap(null);
            });
          };
          that.markers = [];
          that.markers.pushObject(marker);

          var contentString = '<div id="map-clickedlocation-content" >' +
            '<h4>' +
            results[0].formatted_address +
            '</h4>' +
            '<form id="clickedlocation-form">' +
            '<div id="clickedlocation-name-prompt" class="warning">Enter location name to start talking:</div>' +
            '<input id="clickedlocation-name" type="text" /><br>' +
            '<button class="btn btn-primary btn-small" style="margin-bottom:5px" type="submit">' +
            'Start talking</button></form>' +
            '</div>';

          infowindowForClickedLocation = new google.maps.InfoWindow({
            content: contentString
          });
          // infowindowForClickedLocation.setContent(results[0].formatted_address);
          infowindowForClickedLocation.open(that.map, marker);

          // if (that.infoWindows) {
          for (var i = 0; i < that.infoWindows.length; i++) {
            that.infoWindows[i].close();
          }
          // }
          that.infoWindows = [];
          that.infoWindows.push(infowindowForClickedLocation);


          google.maps.event.addListener(infowindowForClickedLocation, 'domready', function() {
            document.getElementById("clickedlocation-form").addEventListener("submit", function(e) {
              // e.stopPropagation();
              e.preventDefault();
              var locationName = e.srcElement.elements['clickedlocation-name'].value;
              if (Ember.isBlank(locationName)) {
                // TODO - warn about empty name
                debugger;
              } else {
                // clear marker;
                marker.setMap(null);
                // that.locationInfoWindowSelected(results[0], locationName); city param is blank:
                that.sendAction('mapClickedAction', 'gmapLocation', results[0], '', locationName);
              }
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
  // locationInfoWindowSelected: function(selectedLocation) {
  //   this.sendAction('mapClickedAction', selectedLocation);
  // },
  locationTopicSelected: function(event, topic) {
    this.sendAction('action', topic);
  },
  locationPostSelected: function(event, post) {
    // TODO implement scrollTO
    Discourse.URL.jumpToPost(post.post_number);
    // this.sendAction('action', post);
  },


  // places search functionality:
  // searchByName: function() {
  //   if (Ember.isBlank(this.nameStringToSearch)) {
  //     return;
  //   };
  //   var searchRequest = {
  //     location: this.map.center,
  //     radius: '10000',
  //     name: this.nameStringToSearch
  //     // types: ['store']
  //   };
  //   this.execPlaceSearch(searchRequest);
  // },
  // searchByKeyword: function() {
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
  // execPlaceSearch: function(searchRequest) {
  //   var that = this;
  //   service = new google.maps.places.PlacesService(this.map);
  //   service.nearbySearch(searchRequest, function(results, status) {
  //     if (status == google.maps.places.PlacesServiceStatus.OK) {
  //       var bounds = new google.maps.LatLngBounds();

  //       if (that.marker) {
  //         // if a marker has previously been set, clear it
  //         that.marker.setMap(null);
  //       };
  //       if (that.markers) {
  //         $.each(that.markers, function(index, value) {
  //           value.setMap(null);
  //         });
  //       };
  //       that.markers = [];
  //       results.forEach(function(value, index) {
  //         var marker = new google.maps.Marker({
  //           position: value.geometry.location,
  //           map: that.map,
  //           title: value.name
  //           // icon: icon
  //           // address: value.title
  //         });
  //         that.markers.pushObject(marker);
  //         var contentString = '<div id="tmap-infowindow-content" >' +
  //           '<a>' +
  //           '<h4 id="firstHeading" class="firstHeading">' + value.name +
  //           '</h4>' +
  //           '<div id="bodyContent">' +
  //           '<small>' + value.vicinity + '</small>' +
  //           '<button class="btn btn-primary btn-small" style="margin-bottom:5px" type="submit">' +
  //           'Use</button></form>' +

  //           '</div></a>' +
  //           '</div>';

  //         var infowindowInstance = new google.maps.InfoWindow({
  //           content: contentString,
  //           searchResult: value
  //         });
  //         google.maps.event.addListener(marker, 'mouseover', function() {
  //           // setTimeout(function() {
  //           //   infowindowInstance.close();
  //           // }, 6000);
  //           for (var i = 0; i < that.infoWindows.length; i++) {
  //             that.infoWindows[i].close();
  //           }
  //           that.infoWindows = [];
  //           that.infoWindows.push(infowindowInstance);
  //           infowindowInstance.open(that.map, marker);
  //         });

  //         google.maps.event.addListener(infowindowInstance, 'domready', function() {
  //           document.getElementById("tmap-infowindow-content").addEventListener("click", function(e) {
  //             e.stopPropagation();
  //             // debugger;
  //             that.sendAction('mapClickedAction', 'placeSearch', infowindowInstance.searchResult, that.get('cityDetails.value'));

  //           });
  //         });
  //         bounds.extend(value.geometry.location);
  //       })
  //       if (that.get('markers.length') > 1) {
  //         that.map.fitBounds(bounds);
  //       } else {
  //         // http://stackoverflow.com/questions/4523023/using-setzoom-after-using-fitbounds-with-google-maps-api-v3
  //         that.map.fitBounds(bounds);
  //         // seems silly but I really have to do all that to get the zoom looking half decent
  //         google.maps.event.addListenerOnce(that.map, 'bounds_changed', function(event) {
  //           if (this.getZoom() > 15) {
  //             this.setZoom(15);
  //           }
  //         });
  //       }

  //     }
  //   });
  // }

});
