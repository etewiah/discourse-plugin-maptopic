// Discourse.MapControllerMixin = Em.Mixin.create({
Discourse.MapFromOneParamController = Discourse.ObjectController.extend({
  actions: {
    startLocationTopic:  function(latlng, geocodedLocation) {
      debugger;
      var locationObject = {
        formattedAddress: geocodedLocation.formatted_address,
        latitude: latlng.lat(),
        longitude: latlng.lng()
      }
      this.set('locationObject', locationObject);
    },
    addLocationToTopic: function() {
      if(Ember.isEmpty(this.get('locationObject.title'))){
        return;
      };
      if (this.get('locationObject')) {
        this.set('model.locationObject', this.get('locationObject'));

      };
      // var self = this;
      // debugger;
      this.send('closeModal');

    },
    topicSelected: function(topic) {
      // this.transitionToRoute('topic.fromParams', topic);
      // above doesn't work
      // https://meta.discourse.org/t/why-does-discourse-use-a-bunch-of-tags-with-unbound-in-the-basic-topic-list-template/10541/4
      this.transitionToRoute('topic.fromParams', Discourse.Topic.create({
        id: topic.id
      }));
    }
  },
  markers: function() {
    var topics = this.get('content.topics');
    var currentMarkerValues = [];
    topics.forEach(function(t) {
      var markerInfo = {
        topic: t,
        location: t.get('location')
        // latitude: t.get('latitude'),
        // longitude: t.get('longitude'),
        // // title: show_time.title,
        // // start_time_string: t.get('start_time_string'),
        // title: t.get('title'),
        // // venueAddress: t.get('excerpt'),
        // venueName: t.get('location_title')

      };
      currentMarkerValues.push(markerInfo);
      // p.user = users[p.user_id];
    });
    return currentMarkerValues;
  }.property()
});

Discourse.MapController = Discourse.ObjectController.extend({
  // need to add composer to be able to start a conversation from here.
  // needs: ['header', 'modal', 'composer', 'quote-button', 'search', 'topic-progress'],
  needs: ['composer'],

  actions: {
    startConversation: function() {
      if (Discourse.User.current()) {
        var composerController = this.get('controllers.composer');
        var self = this;
        composerController.open({
          action: Discourse.Composer.CREATE_TOPIC,
          draftKey: "new_topic"
        }).then(function() {
          // composerController.appendText('slightly longer ...New event weee');
          // as this is about no gig in particular...:
          // composerController.content.set('gig', {
          //   id: 0
          // });
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
