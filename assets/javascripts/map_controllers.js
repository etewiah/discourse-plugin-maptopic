

Discourse.MapControllerMixin = Em.Mixin.create({

  needs: ['header', 'modal', 'composer', 'quote-button', 'search', 'topic-progress'],

  markers: function() {
    var topics = this.get('content.topics');
    // debugger;
    var currentMarkerValues = [];
    var longitude = -0.1;
    // this.get('longitude');
    var latitude = 5.9;
    // this.get('latitude');

    if (latitude && latitude != "unknown") {
      var latLngValue = {
        latitude: latitude,
        longitude: longitude,
        // title: show_time.title,
        start_time_string: this.get('start_time_string'),
        title: this.get('title'),
        venueAddress: this.get('venue_address'),
        venueName: this.get('venue_name')

      };
      currentMarkerValues.push(latLngValue);
    }
    return currentMarkerValues;
  }.property(),

  actions: {
    startConversation: function() {
      debugger;
      if (Discourse.User.current()) {
        var composerController = this.get('controllers.composer');
        var self = this;
        composerController.open({
          action: Discourse.Composer.CREATE_TOPIC,
          draftKey: "new_topic"
        }).then(function() {
          // composerController.appendText('slightly longer ...New event weee');
          // as this is about no gig in particular...:
          composerController.content.set('gig',{ id: 0});
          // debugger;
        });
      } else {
        this.send('showLogin');
      }
      //return true to bubble up to route...
      return false;
    }
  }

});

Discourse.MapFromOneParamController = Discourse.ObjectController.extend(Discourse.MapControllerMixin,{
});
Discourse.MapRootController = Discourse.ObjectController.extend(Discourse.MapControllerMixin,{
});
