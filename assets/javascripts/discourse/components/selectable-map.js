Discourse.SelectableMapIsDoubleClicked = false;
Discourse.LastSelectedLatLng = {};

Discourse.SelectableMapComponent = Ember.Component.extend({


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
            $.getScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=map_callback');
        } else {
            this.initiateMaps();
        }
        // }
    },

    initiateMaps: function() {
        // var currentMarkerValues = this.get('markers');
        var defaultCity = {
            city_name: "madrid",
            songkick_id: "28755",
            longitude: "-3.7037902",
            latitude: "40.4167754",
            country: "Spain",
            range: "15"
        }
        var mapCenter = new google.maps.LatLng(defaultCity.latitude,
            defaultCity.longitude);


        var zoom = 15;
        var icon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

        var mapOptions = {
            zoom: zoom,
            center: mapCenter,
            mapTypeId: google.maps.MapTypeId.ROADMAP
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

                // debugger;

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
                } else {
                    alert("No results found");
                }
            } else {
                alert("Geocoder failed due to: " + status);
            }
        });

        // this.get("controller").addEvent(lat, lng);
    }
});
