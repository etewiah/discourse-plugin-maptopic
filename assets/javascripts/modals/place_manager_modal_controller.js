Discourse.PlaceManagerModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  needs: ['topic'],
  actions: {
    removePlace: function(){
      var topicController = this.get('controllers.topic');
      topicController.send('removePlace', this.get('content'));
      this.send('closeModal');
    },
    searchForPlace: function() {
      this.runGooglePlacesSearch();
    },
    confirmPlaceDetails: function(confirmedDetails) {
      var updatedPlace = Discourse.Location.geoPlaceFromGooglePlace(confirmedDetails)
      // updatedPlace.detailsConfirmed = true;
      updatedPlace.source = "detailedGpSearch";
        // TODO - move below to model ovject

      var geo_place_update = Discourse.ajax("/geo_topics/update_geo_places", {
        data: {
          place: updatedPlace,
          location_id: this.get('content.location_id'),
          topic_id: this.get('content.topic_id')
        },
        method: 'POST'
      });

      geo_place_update.then(function(result) {
        // debugger;
      });
    },
    correctSearchResultSelected: function(searchResult) {
      // var placeDetails = this.get('content');
      this.set('googlePlace', searchResult);
    },
    searchByKeyword: function() {
      var query = this.get('searchKeyword');
      debugger;
      this.runGooglePlacesSearch("text", query);
    },
    searchNearby: function(){
      this.runGooglePlacesSearch();
    }

  },
  runGooglePlacesSearch: function(searchType, query) {
    var placeDetails = this.get('content');
    var latlng = new google.maps.LatLng(placeDetails.location.latitude, placeDetails.location.longitude);


    var request = {
      location: latlng,
      // radius: '100'
      rankBy: google.maps.places.RankBy.DISTANCE,
      types: ['cafe', 'night_club', 'restaurant', 'museum', 'bar', 'food', 'store', 'establishment']

      // types: ['store']
    };

    var service = new google.maps.places.PlacesService(placeDetails.map);
    var that = this;
    if (searchType && searchType === "text") {
      request = {
        location: latlng,
        radius: '200',
        query: query
      };
      service.textSearch(request, function(results, status) {
        debugger;
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          that.set('nearbyPlaces', results);
          that.set('placeDetailsConfirmed', false);
          that.set('googlePlace', null);
        }
      });
    } else {
      service.nearbySearch(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          that.set('nearbyPlaces', results);
          that.set('placeDetailsConfirmed', false);
          that.set('googlePlace', null);
        }
      });
    };

  },
  onShow: function() {
    // make sure any previous search results are cleared out
    this.set('nearbyPlaces', null);

    var placeDetails = this.get('content');
    this.set('googlePlace', null);
    if (placeDetails.location.detailsConfirmed) {
      // not working correctly at the moment
      // this.set('placeDetailsConfirmed', true);
      // debugger;
      // return;
    };
    if (placeDetails.location.gplace_id) {
      var request = {
        placeId: placeDetails.location.gplace_id
      };

      var infowindow = new google.maps.InfoWindow();
      var service = new google.maps.places.PlacesService(placeDetails.map);
      var that = this;
      service.getDetails(request, function(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          that.set('googlePlace', place);
        }
      });
    } else {
      // search for closeby places
      // this.runGooglePlacesSearch();
      // service.nearbySearch(request, callback);
    }
  },
  googlePlaceDetails: function() {
    return this.get('googlePlace');
  }.property('googlePlace'),

  nearbyPlacesDetails: function() {
    return this.get('nearbyPlaces');
  }.property('nearbyPlaces'),

  primaryImageUrl: function() {
    var photos = this.get('googlePlaceDetails.photos');
    if (photos && photos.length > 0) {
      // debugger;
      return photos[0].getUrl({
        'maxWidth': 350,
        'maxHeight': 350
      })
    } else {
      return null;
    };
    // return "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=40";
  }.property('googlePlaceDetails'),

});
