// Discourse.MapControllerMixin = Em.Mixin.create({
Discourse.MapFromOneParamController = Discourse.ObjectController.extend({
  needs: ['composer'],

  actions: {
    startLocationTopic: function(geocodedLocation, title) {
      var city = '';
      var country = '';
      $.each(geocodedLocation.address_components, function(i, address_component) {
        if (address_component.types[0] == "locality") {
          city = address_component.long_name;
        }
        if (address_component.types[0] == "country") {
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
        }
        // this.set('locationObject', locationObject);
      if (Discourse.User.current()) {
        var composerController = this.get('controllers.composer');
        var self = this;
        composerController.open({
          action: Discourse.Composer.CREATE_TOPIC,
          draftKey: "new_topic"
        }).then(function() {
          composerController.content.set('locationObject', locationObject);
        });
      } else {
        this.send('showLogin');
      }
      //return true to bubble up to route...
      return false;
    },
    addLocationToTopic: function() {
      if (Ember.isEmpty(this.get('locationObject.title'))) {
        return;
      };
      if (this.get('locationObject')) {
        this.set('model.locationObject', this.get('locationObject'));

      };
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
        // // venueAddress: t.get('excerpt'),
        // venueName: t.get('location_title')

      };
      currentMarkerValues.push(markerInfo);
      // p.user = users[p.user_id];
    });
    return currentMarkerValues;
  }.property('content')
});

// not using object controller as I won't be setting its content..
Discourse.MapController = Discourse.Controller.extend({
  // went back to objectcontroller at some point when I was worried it might be needed
  // to ensure observers triggered - that wasn't necessary though
// Discourse.MapController = Discourse.ObjectController.extend({
  // need to add composer to be able to start a conversation from here.
  // needs: ['header', 'modal', 'composer', 'quote-button', 'search', 'topic-progress'],
  needs: ['composer', 'map-from-one-param'],

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
        });
      } else {
        this.send('showLogin');
      }
      //return true to bubble up to route...
      return false;
    },
    // below is primary action passed into simple-dropdown component
    // but is also called by add_city_modal directly
    cityChanged: function(newCity) {
      var params = {
        currentCity: newCity
      }

      var topiclist = Discourse.TopicList.findWhereLocationPresent("", params);
      this.transitionToRoute('map.fromOneParam', topiclist);
    },
    addLocation: function(newLocation) {
      // var mfopController = this.get('controllers.map-from-one-param');
      // mfopController.get('model')
      // not entire sure why above always returns null :(
      // below calls method defined in application_route
      this.send('showAddCityModal');

    }

  },



  currentCitySelection: function() {
    var currentCity = this.get('currentCity') || Discourse.SiteSettings.maptopic.defaultCityName;
    return this.get('citySelectionItemsWithUrls').findBy('value', currentCity);
  }.property('currentCity', 'citySelectionItemsWithUrls'),


  // below updates the citySelectionItems
  citySelectionItemsWithUrls: function() {
    var selectionItems = Discourse.SiteSettings.maptopic.citySelectionItems;
    selectionItems.forEach(function(item) {
      item.url = this.get('target').generate('map.fromOneParam', {
        currentCity: item.value
      });
      // "http://google.com";
    }, this);
    // below will add a city from the url that is not in the list:
    // now doing that closer to the bone (in topic_list_model where I get city long etc from server..)
    // if(!selectionItems.findBy('value', this.get('currentCity').toLowerCase())){
    //   selectionItems.pushObject({
    //     displayString: this.get('currentCity').capitalize(),
    //     value: this.get('currentCity').toLowerCase()

    //   });
    // }
    return selectionItems;
  }.property(),


});

// Discourse.MapFromOneParamController = Discourse.ObjectController.extend(Discourse.MapControllerMixin, {});
// Discourse.MapRootController = Discourse.ObjectController.extend(Discourse.MapControllerMixin, {});
