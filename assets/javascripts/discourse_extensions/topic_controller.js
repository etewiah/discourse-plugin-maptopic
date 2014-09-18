require("discourse/controllers/topic")["default"].reopen({
  actions: {
    showOnMap: function(post){
      Discourse.URL.jumpToPost(1);
      // debugger;
      this.set('activePost',post);
    },
    replyWithLocation: function(geocodedLocation, title) {
      var locationObject = {
          formattedAddress: geocodedLocation.formatted_address,
          latitude: geocodedLocation.geometry.location.lat(),
          longitude: geocodedLocation.geometry.location.lng(),
          title: title

        }
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
