Discourse.PlaceManagerModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  needs: ['topic'],
  actions: {
    removePlace: function(){
      // passing actions through to originating controller for now as its easier
      // longer term, this might not be a good idea - will need to change this code
      // to make it work with other originating controllers.
      // Could have passed in all the places in the model so I could update them with tne 
      // new array but that didn't feel quite right either
      var topicController = this.get('controllers.topic');
      topicController.send('removePlace', this.get('content'));
      this.send('closeModal');
    },
    searchForPlace: function() {
      this.runGooglePlacesSearch();
    },
    confirmPlaceDetails: function(confirmedDetails) {
      var topicController = this.get('controllers.topic');
      topicController.send('confirmPlaceDetails', confirmedDetails);
      this.send('closeModal');
    },
    correctSearchResultSelected: function(searchResult) {
      // var placeDetails = this.get('content');
      this.set('googlePlace', searchResult);
    },
    searchByKeyword: function() {
      var query = this.get('searchKeyword');
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
  // onClose
  onShow: function() {
    // make sure any previous search results are cleared out
    this.set('nearbyPlaces', null);

    var placeDetails = this.get('content');
    this.set('googlePlace', null);
    // if (placeDetails.location.status_flag === "details_confirmed") {
    //   // this.set('placeDetailsConfirmed', true);
    //   debugger;
    //   return;
    // };
    var detailsConfirmed = (placeDetails.location.status_flag === "details_confirmed");
    if (!detailsConfirmed && placeDetails.location.gplace_id) {
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
  geoPlaceDetails: function() {
    var googlePlace = this.get('googlePlace');
    if (googlePlace) {
      var geoPlace = Discourse.Location.geoPlaceFromGooglePlace(googlePlace);
      geoPlace.location_id = this.get('content.location.location_id');
      return geoPlace;
    } else{
      return this.get('content.location');
    };
  }.property('googlePlace','content'),

  nearbyPlacesDetails: function() {
    return this.get('nearbyPlaces');
  }.property('nearbyPlaces'),

  primaryImageUrl: function() {
    var photos = this.get('geoPlaceDetails.photos');
    if (photos && photos.length > 0) {
      return photos[0].getUrl({
        'maxWidth': 350,
        'maxHeight': 350
      })
    } else {
      return null;
    };
    // return "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=40";
  }.property('geoPlaceDetails'),

});
