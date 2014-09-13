// Discourse.DisplayMapIsDoubleClicked = false;
// Discourse.LastSelectedLatLng = {};

Discourse.TopicsMapComponent = Ember.Component.extend({

  doubleClicked: false,
  clickEvent: null,

  markersChanged: function() {
    // for re-rendering as I browse
    this.displayMapIfNeeded();
  }.observes('markers'),

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
    var currentMarkerValues = this.get('markers');
    var markersFound = currentMarkerValues && currentMarkerValues.length > 0;
    // if (markersFound && !_mobile_device_) {
    // might need to reintroduce logic of detecting _mobile_device_
    if (markersFound) {
      // this.initiateMaps(currentMarkerValues);
      if(typeof google === "undefined"){
        var self = this;
        window.map_callback = function() {
          self.initiateMaps();
        }
        $.getScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=map_callback');
      }
      else{
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
    var icon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

    if (this.get('isfestival')) {
      zoom = 11;
      icon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10
      }
    }


    var mapOptions = {
      zoom: zoom,
      center: mapCenter,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // debugger;
    var map = new google.maps.Map(document.getElementById(
        'topics-map-canvas'),
      mapOptions);

    var bounds = new google.maps.LatLngBounds();
    // TODO - ensure I have unique markers where location is same
    // var uniqueMarkerValues = [];
    // $.each(currentMarkerValues, function(index, value) {
    //  // console.log(uniqueMarkerValues);
    //  uniqueMarkerValues.push(value);
    //  debugger;

    // });
    $.each(currentMarkerValues, function(index, value) {
      var myLatlng = new google.maps.LatLng(value.latitude, value.longitude);
      // (52.519171, 13.4060912);
      // latlngbounds.extend(latLng);
      bounds.extend(myLatlng);
      var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: value.title,
        icon: icon
        // address: value.title
      });

      var that = this;
      var contentString = '<div id="content">' +
        '<div id="siteNotice">' +
        '</div>' +
        '<h5 id="firstHeading" class="firstHeading">' + value.title +
        '</h5>' +
        '<div id="bodyContent">' +
       '<p>at ' + value.venueName + '</p>' +
        '</div>' +
        '</div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      google.maps.event.addListener(marker, 'mouseover', function() {
        setTimeout(function() {
          infowindow.close();
        }, 6000);
        infowindow.open(map, marker);
      });
    });

    // below is only really useful when I'm showing more than 1 marker on the map...
    Ember.run.later(this, function() {
     if (this.get('markers.length') > 1) {
       // debugger;
       map.fitBounds(bounds);
     } else {}
     google.maps.event.trigger(map, 'resize');
     // map.setCenter(marker.getPosition());

    }, 500);


  }
});
