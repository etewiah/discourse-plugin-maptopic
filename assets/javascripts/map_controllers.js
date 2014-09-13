// Discourse.MapControllerMixin = Em.Mixin.create({
Discourse.MapFromOneParamController = Discourse.ObjectController.extend({
  markers: function() {
    var topics = this.get('content.topics');
    var currentMarkerValues = [];
    topics.forEach(function(t) {
      var latLngValue = {
        latitude: t.get('latitude'),
        longitude: t.get('longitude'),
        // title: show_time.title,
        // start_time_string: t.get('start_time_string'),
        title: t.get('title'),
        // venueAddress: t.get('excerpt'),
        venueName: t.get('location_title')

      };
      currentMarkerValues.push(latLngValue);
      // p.user = users[p.user_id];
    });

    return currentMarkerValues;
  }.property()
});

Discourse.MapController = Discourse.ObjectController.extend({
  // need to add composer to be able to start a conversation from here.
  needs: ['header', 'modal', 'composer', 'quote-button', 'search', 'topic-progress'],

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
          composerController.content.set('gig', {
            id: 0
          });
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

// Discourse.MapFromOneParamController = Discourse.ObjectController.extend(Discourse.MapControllerMixin, {});
// Discourse.MapRootController = Discourse.ObjectController.extend(Discourse.MapControllerMixin, {});
