Discourse.PlacesExplorerModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  needs: ['topic','mapFromOneParam'],
  actions: {
    // goToPost: function(post) {
    //   var topicController = this.get('controllers.topic');
    //   var postNumber = post.get('post_number');
    //   topicController.set('currentPost', postNumber);
    //   // to do - ensure scroll to correct post:
    //   Discourse.URL.jumpToPost(postNumber);
    //   // this.set('model.activePost', post);
    //   this.send('closeModal');
    // },

    namedCitySelected: function() {
      var placeName = this.get('placeName');      
      if (placeName.length < 2) {
        this.set('validate', true);
        return;
      }
      var clickedLocation = this.get('model.clickedLocation');
      // todo = see if I can get city and country from geo...
      var locationObject = Discourse.Location.locationFromGmap(clickedLocation, "city", "country");
      locationObject.title = placeName;

      debugger;


      this.send('sendActionToController', locationObject);
    },
    searchResultSelected: function(searchResult) {
      var locationObject = Discourse.Location.locationFromPlaceSearch(searchResult, "");
      // var topicController = this.get('controllers.topic');
      // topicController.send('replyWithLocationObject', locationObject);
      this.send('sendActionToController', locationObject);
    },
    sendActionToController: function(locationObject) {
      var context = this.get('content.context');
      if (context === "index_map") {
        var targetController = this.get('controllers.mapFromOneParam');
        targetController.send('showNewTopicModal', 'info', locationObject);
        debugger;

      } else {
        var topicController = this.get('controllers.topic');
        topicController.send('replyWithLocationObject', locationObject);
        this.send('closeModal');
      };
      
    }

  },
  placeNameValidation: function() {
    if (!this.get('validate')) {
      return;
    };
    // If blank, fail without a reason
    // if (this.blank('placeName')) return Discourse.InputValidation.create({
    //   failed: true
    // });
    // If too short
    if (this.blank('placeName') || this.get('placeName').length < 3) {
      debugger;

      return Discourse.InputValidation.create({
        failed: true,
        reason: "Place name has to be at least 3 characters long."
      });
    };

    // Looks good!
    return Discourse.InputValidation.create({
      ok: true,
      reason: "Place name looks good."
    });
  }.property('validate', 'placeName'),
  onShow: function() {
    var placeDetails = this.get('content');
    var latitude = placeDetails.clickedLocation.geometry.location.lat();
    var longitude = placeDetails.clickedLocation.geometry.location.lng();
    // 
    // this.set('googlePlace', null);

    // search for closeby places
    var latlng = new google.maps.LatLng(latitude, longitude);

    var request = {
      location: latlng,
      rankBy: google.maps.places.RankBy.DISTANCE,
      types: ['cafe', 'night_club', 'restaurant', 'museum', 'bar', 'food', 'store', 'establishment']
        // []|night_club|restaurant|museum|bar|food|store']
        // types: ['store']
    };

    var service = new google.maps.places.PlacesService(placeDetails.map);
    var that = this;
    service.nearbySearch(request, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        // debugger;
        that.set('nearbyPlaces', results.slice(0, 10));
        // for (var i = 0; i < results.length; i++) {
        //   var place = results[i];
        //   createMarker(results[i]);
        // }
      }
    });
    // service.nearbySearch(request, callback);
  },
  // googlePlaceDetails: function() {
  //   return this.get('googlePlace');
  // }.property('googlePlace'),

  nearbyPlacesDetails: function() {
    return this.get('nearbyPlaces');
  }.property('nearbyPlaces')

});
