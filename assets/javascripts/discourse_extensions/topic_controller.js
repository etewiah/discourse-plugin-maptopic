require("discourse/controllers/topic")["default"].reopen({
  needs: ['map'],
  setUserPreferredCity: function() {
    // TODO set currentCity for map here (and also as custom user field)
    // need to get geocoder working first though..
    // if (this.get('location.city')) {
    //   var mapController = this.get('controllers.map');
    //   debugger;
    //   // setting below should ensure that map.route uses this as default city..
    //   mapController.set('currentCity', this.get('location.city'));
    // }
    // this._super();
  }.observes('location'),
  // contextChanged2: function() {
  //   debugger;
  //   // this.set('controllers.search.searchContext', this.get('model.searchContext'));
  // }.observes('topic'),

  actions: {
    // showOnMap: function(post){
    //   Discourse.URL.jumpToPost(1);
    //   // debugger;
    //   this.set('activePost',post);
    // },
    replyWithLocation: function(geocodedLocation, title) {
      // http://stackoverflow.com/questions/6359995/get-city-from-geocoder-results
      // why does this have to be so hard!!!
      var arrAddress = geocodedLocation.address_components;
      // var itemRoute = '';
      var city = '';
      var country = '';

      // iterate through address_component array
      $.each(arrAddress, function(i, address_component) {
        // console.log('address_component:' + i);

        if (address_component.types[0] == "locality") {
          // console.log("town:" + address_component.long_name);
          city = address_component.long_name;
        }

        if (address_component.types[0] == "country") {
          // console.log("country:" + address_component.long_name);
          country = address_component.long_name;
        }

        //return false; // break the loop   
      });

      var locationObject = {
        formattedAddress: geocodedLocation.formatted_address,
        latitude: geocodedLocation.geometry.location.lat(),
        longitude: geocodedLocation.geometry.location.lng(),
        title: title,
        city: city,
        country: country
      };
      debugger;

      // this.set('locationObject', locationObject);
      if (Discourse.User.current()) {
        var composerController = this.get('controllers.composer');
        var topic = this.get('model');
        // var self = this;

        var opts = {
          action: Discourse.Composer.REPLY,
          draftKey: topic.get('draft_key'),
          draftSequence: topic.get('draft_sequence'),
          topic: topic
        };

        // if(post && post.get("post_number") !== 1){
        //   opts.post = post;
        // } else {
        //   opts.topic = topic;
        // }

        composerController.open(opts).then(function() {
          composerController.content.set('locationObject', locationObject);
        });
      } else {
        this.send('showLogin');
      }
      //return true to bubble up to route...
      return false;
    }
  }
});
