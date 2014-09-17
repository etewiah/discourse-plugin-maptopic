// Discourse.DisplayMapIsDoubleClicked = false;
// Discourse.LastSelectedLatLng = {};

Discourse.TopicsMapComponent = Ember.Component.extend({

  doubleClicked: false,
  clickEvent: null,

  markersChanged: function() {
    debugger;
    // for re-rendering as I browse
    this.displayMapIfNeeded();
  }.observes('markers'),

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
    var topic_icon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    var post_icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";


    var styles = [{
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [{
          "visibility": "off"
        }]
      }

    ];

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
    var that = this;

    $.each(currentMarkerValues, function(index, value) {
      if (value.post) {
        var icon = post_icon;
        var userName = value.post.name;
        var title = value.location.title;
        var dataObject = value.post;
        var dataObjectType = 'post';
      } else if (value.topic) {
        var icon = topic_icon;
        var userName = value.topic.get('details.created_by.username');
        var title = value.location.title;
        var dataObject = value.topic;
        var dataObjectType = 'topic';

      } else {
        return;
      };

      console.log(value);

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
        '<h5 id="firstHeading" class="firstHeading">' + title +
        '</h5>' +
        '<div id="bodyContent">' +
        '<p>' + userName + '</p>' +
        '</div>' +
        '</div>';

      var infowindowInstance = new google.maps.InfoWindow({
        content: contentString,
        dataObject: dataObject,
        dataObjectType: dataObjectType

      });
      google.maps.event.addListener(marker, 'mouseover', function() {
        setTimeout(function() {
          infowindowInstance.close();
        }, 6000);
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
          that.locationPostSelected(e, infowindowInstance.dataObject);
        }

      });

    });

    if (this.get('markers.length') > 1) {
      this.map.fitBounds(bounds);
    } else {
      // if there is only one marker, set center to be that one
      // even though I initialized the map with this center, it seems necessary to call this again
      this.map.setCenter(mapCenter);
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
          if (that.marker) {
            debugger;
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
          debugger;
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
  locationTopicSelected: function(event, topic) {
    this.sendAction('action', topic);
  },
  locationPostSelected: function(event, topic) {
    debugger;
    this.sendAction('action', topic);
  }
});
