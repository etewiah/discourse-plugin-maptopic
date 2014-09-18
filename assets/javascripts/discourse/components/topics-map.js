// Discourse.DisplayMapIsDoubleClicked = false;
// Discourse.LastSelectedLatLng = {};

Discourse.TopicsMapComponent = Ember.Component.extend({


  // isCenteredBinding: 'controller.activePost',
  onActivePostChange: function() {
    var activePost = this.get('activePost');
    // debugger;
    if (this.get('activePost.post_number') === 1) {
      var icon = this.topic_icon;
      var userName = activePost.topic.get('posters.firstObject.user.username') || activePost.topic.get('details.created_by.username');
      var title = activePost.topic.get('title') + "( " + activePost.topic.get('location.title') + " )";
      var dataObject = activePost.topic;
      var dataObjectType = 'topic';
      var myLatlng = new google.maps.LatLng(activePost.topic.location.latitude, activePost.topic.location.longitude);
      var address = activePost.topic.location.address;
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


    var contentString = '<div id="map-infowindow-content" >' +
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
      document.getElementById("map-infowindow-content").addEventListener("click", function(event) {
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

  // markersChanged: function() {
  //   debugger;
  //   // for re-rendering as I browse
  //   this.displayMapIfNeeded();
  // }.observes('markers'),

  markerAdded: function() {
    // debugger;
    // for re-rendering as I browse
    this.displayMapIfNeeded();
  }.observes('markers.length'),
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
    this.displayMapIfNeeded();
  },

  displayMapIfNeeded: function() {
    var currentMarkerValues = this.get('markers');
    var markersFound = currentMarkerValues && currentMarkerValues.length > 0;
    // if (markersFound && !_mobile_device_) {
    // might need to reintroduce logic of detecting _mobile_device_
    if (markersFound) {
      // this.initiateMaps(currentMarkerValues);
      if (typeof google === "undefined") {
        var self = this;
        window.map_callback = function() {
          self.initiateMaps();
        }
        $.getScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=map_callback');
      } else {
        this.initiateMaps();
      }
    }
  },

  // highlighted_icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  topic_icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  post_icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",

  initiateMaps: function() {
    var currentMarkerValues = this.get('markers');
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


    // this.map.setOptions({
    //   styles: styles
    // });

    var bounds = new google.maps.LatLngBounds();
    // TODO - ensure I have unique markers where location is same
    // var uniqueMarkerValues = [];
    // $.each(currentMarkerValues, function(index, value) {
    //  // console.log(uniqueMarkerValues);
    //  uniqueMarkerValues.push(value);

    // });
    this.infoWindows = [];
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
      var contentString = '<div id="map-infowindow-content" >' +
        '<div id="siteNotice">' +
        '</div>' +
        '<h4 id="firstHeading" class="firstHeading">' + title +
        '</h4>' +
        '<div id="bodyContent">' +
        '<small>By: ' + userName + '</small>' +
        '</div>' +
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

      // google.maps.event.addListener(infowindowInstance, 'click', function(event) {
      //   debugger;

      // });

      google.maps.event.addListener(infowindowInstance, 'domready', function() {
        document.getElementById("map-infowindow-content").addEventListener("click", function(e) {
          e.stopPropagation();
          // console.log("hi!");
          // debugger;
          if (infowindowInstance.dataObjectType === 'topic') {
            that.locationTopicSelected(e, infowindowInstance.dataObject);
          } else if (infowindowInstance.dataObjectType === 'post') {
            that.locationPostSelected(e, infowindowInstance.dataObject);
          }

        });
      });

      google.maps.event.addListener(marker, 'click', function(event) {
        if (infowindowInstance.dataObjectType === 'topic') {
          that.locationTopicSelected(event, infowindowInstance.dataObject);
        } else if (infowindowInstance.dataObjectType === 'post') {
          that.locationPostSelected(event, infowindowInstance.dataObject);
        }

      });

    });

    if (this.get('markers.length') > 1) {
      this.map.fitBounds(bounds);
    } else {
      // if there is only one marker, set center to be that one
      // even though I initialized the map with this center, it seems necessary to call this again
      // this.map.setCenter(mapCenter);
      // http://stackoverflow.com/questions/4523023/using-setzoom-after-using-fitbounds-with-google-maps-api-v3
      this.map.fitBounds(bounds);
      this.map.setZoom(zoom);
    }

    // Ember.run.later(this, function() {
    //   // if (this.get('markers.length') > 1) {
    //   //   map.fitBounds(bounds);
    //   // } else {}
    //   // google.maps.event.trigger(map, 'resize');
    //   // map.setCenter(marker.getPosition());

    // }, 500);
    google.maps.event.addListener(that.map, 'click', function(event) {
      that.mapClicked(event.latLng.lat(), event.latLng.lng());
    });

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
          // that.map.setZoom(11);
          if (that.markerForClickedLocation) {
            // if a marker has previously been set, clear it
            that.markerForClickedLocation.setMap(null);
          }
          that.markerForClickedLocation = new google.maps.Marker({
            position: latlng,
            map: that.map
          });

          var contentString = '<div id="map-clickedlocation-content" >' +
            '<h5>' +
            results[0].formatted_address +
            '</h5>' +
            '<form id="clickedlocation-form">' +
            '<div id="clickedlocation-name-prompt" class="warning">Enter the name of this location:</div>' +
            '<input id="clickedlocation-name" type="text" />' +
            '<input type="submit" id="map-go" value="Go" />' +
            '</form>' +
            '</div>';

          infowindowForClickedLocation = new google.maps.InfoWindow({
            content: contentString
          });
          // infowindowForClickedLocation.setContent(results[0].formatted_address);
          infowindowForClickedLocation.open(that.map, that.markerForClickedLocation);

          google.maps.event.addListener(infowindowForClickedLocation, 'domready', function() {
            document.getElementById("clickedlocation-form").addEventListener("submit", function(e) {
              e.stopPropagation();
              e.preventDefault();
              var locationName = e.srcElement.elements['clickedlocation-name'].value;
              if (Ember.isBlank(locationName)) {
                debugger;
              } else {
                // clear marker;
                that.markerForClickedLocation.setMap(null);
                // that.locationInfoWindowSelected(results[0], locationName);
                that.sendAction('mapClickedAction', results[0], locationName);

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
  }
});
