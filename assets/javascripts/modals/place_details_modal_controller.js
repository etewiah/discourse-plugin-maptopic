Discourse.PlaceDetailsModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  needs: ['topic'],
  actions: {
    goToPost: function(post) {
      var topicController = this.get('controllers.topic');
      var postNumber = post.get('post_number');
      topicController.set('currentPost', postNumber);
      // to do - ensure scroll to correct post:
      Discourse.URL.jumpToPost(postNumber);
      // this.set('model.activePost', post);
      this.send('closeModal');
    },
    replyWithLocation: function(locationObject) {
      var topicController = this.get('controllers.topic');
      topicController.send('replyWithLocationObject', locationObject);
      this.send('closeModal');
    }

  },

  onShow: function() {
    var placeDetails = this.get('content');
    this.set('googlePlace', null);
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
      var latlng = new google.maps.LatLng(placeDetails.location.latitude, placeDetails.location.longitude);


      var request = {
        location: latlng,
        radius: '50'
          // types: ['store']
      };

      var service = new google.maps.places.PlacesService(placeDetails.map);
      var that = this;
      service.nearbySearch(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          // debugger;
          that.set('nearbyPlaces', results);
          // for (var i = 0; i < results.length; i++) {
          //   var place = results[i];
          //   createMarker(results[i]);
          // }
        }
      });
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
