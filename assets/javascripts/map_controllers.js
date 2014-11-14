// Discourse.MapControllerMixin = Em.Mixin.create({
Discourse.MapFromOneParamController = Discourse.ObjectController.extend({
  needs: ['composer', 'map'],

  actions: {
    // triggered by start conversation button
    // or by places explorer model - in which case will have location object
    showNewTopicModal: function(topicType, locationObject) {
      if (!Discourse.User.current()) {
        this.send('showLogin');
        return;
      }
      var geo = {};
      var currentGeoKey = this.get('controllers.map.currentGeoKey');
      currentGeoKey.capability = topicType;

      // in future might allow country bounds etc..
      // var currentCitySelection = this.get('controllers.map.currentCitySelection');
      if (locationObject) {
        currentGeoKey.initial_location = locationObject;
      };

      this.send('showDiscourseModal', 'newTopicModal', currentGeoKey);
    },

    // triggered by clicking on infowindow after doubleclicking map
    showExplorerModal: function(locationInfo) {
      // if (!Discourse.User.current()) {
      //   this.send('showLogin');
      //   return;
      // }
      // debugger;
      locationInfo.context = "index_map";
      this.send('showDiscourseModal', 'placesExplorerModal', locationInfo);
    },

    // triggered by clicking on search result infowindow 
    startLocationTopic: function(searchResult, geo) {
      if (!Discourse.User.current()) {
        this.send('showLogin');
        return;
      }
      var locationObject = Discourse.Location.locationFromPlaceSearch(searchResult, "");

      var currentGeoKey = this.get('controllers.map.currentGeoKey');
      // could have used the geo object thats passed in - same same

      currentGeoKey.initial_location = locationObject;
      currentGeoKey.capability = "info";
      this.send('showDiscourseModal', 'newTopicModal', currentGeoKey);

      //return true to bubble up to route...
      return false;
    },
    // what triggers this?
    initiateAddLocationToTopic: function() {
      debugger;
      if (Ember.isEmpty(this.get('locationObject.title'))) {
        return;
      };
      if (this.get('locationObject')) {
        this.set('model.locationObject', this.get('locationObject'));

      };
      this.send('closeModal');
    },

    topicSelected: function(detailsForMarker) {
      var topic = Discourse.Topic.create(
        detailsForMarker.topic
      );
      Discourse.URL.routeTo(topic.get('url'));
      // above fixed issue with suggested topics for a topic not being routed to properly..

      // this.transitionToRoute('topic.fromParams', topic);
      // above doesn't work
      // https://meta.discourse.org/t/why-does-discourse-use-a-bunch-of-tags-with-unbound-in-the-basic-topic-list-template/10541/4
      // this.transitionToRoute('topic.fromParams', Discourse.Topic.create({
      //   id: detailsForMarker.topic.id
      // }));
    },
    sharePopup: function(target, url) {
      window.open(url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=' + Discourse.ShareLink.popupHeight(target));
      return false;
    }
  },
  cityShareLinks: function() {
    var link = window.location.href;
    var title = "What's being said about " + this.get('content.geo_key.display_name');
    // if (link.indexOf("/") === 0) {
    //   link = window.location.protocol + "//" + window.location.host + link;
    // }
    return Discourse.SiteSettings.share_links.split('|').map(function(i) {
      if (Discourse.ShareLink.supportedTargets.indexOf(i) >= 0) {
        return Discourse.ShareLink.create({
          target: i,
          link: link,
          topicTitle: title
        });
      } else {
        return null;
      }
    }, this).compact();
  }.property('content'),
  cityQuestionsTitle: function() {
    if (this.get('content.geo_key.display_name')) {
      return "Questions regarding " + this.get('content.geo_key.display_name');
    };
  }.property('content'),
  markers: function() {
    var geo_conversations = this.get('content.geo_topics');
    var currentMarkerValues = [];

    geo_conversations.forEach(function(t) {
      // if (t.primary_location) {
      if (t.locations.length > 0) {
        // using the first location in a topic is a bit lazy
        // TODO - look for more sensible way of geting primary location
        var markerInfo = {
          // context: 'index_view',
          topic: t,
          location: t.locations[0]
        };
        currentMarkerValues.push(markerInfo);
      } else {}
      // p.user = users[p.user_id];
    });
    return currentMarkerValues;
  }.property('content'),
  otherTopics: function() {
    var other_conversations = this.get('content.other_topics');
    var otherTopics = [];
    other_conversations.forEach(function(t) {
      var topicObject = Discourse.Topic.create(t);
      // basic-topic-list needs fancy_title
      topicObject.set('fancy_title', topicObject.get('title'));
      otherTopics.push(topicObject);
    });
    return otherTopics;
  }.property('content'),
  cityQuestions: function() {
    var topics = this.get('content.geo_topics');
    var cityQuestions = [];
    topics.forEach(function(t) {
      if (t.capability === "question") {
        var topicObject = Discourse.Topic.create(t);
        // basic-topic-list needs fancy_title
        topicObject.set('fancy_title', topicObject.get('title'));
        cityQuestions.push(topicObject);
      }
    });
    if (cityQuestions.length > 0) {
      return cityQuestions;
    } else {
      return null;
    };

  }.property('content'),
});

// not using object controller as I won't be setting its content..
Discourse.MapController = Discourse.Controller.extend({
  // went back to objectcontroller at some point when I was worried it might be needed
  // to ensure observers triggered - that wasn't necessary though
  // Discourse.MapController = Discourse.ObjectController.extend({
  // need to add composer to be able to start a conversation from here.
  // needs: ['header', 'modal', 'composer', 'quote-button', 'search', 'topic-progress'],
  needs: ['composer', 'map-from-one-param'],

  isAdmin: function() {
    // temporarily needed so I can try new feature in prod
    return Discourse.User.currentProp("admin");
  }.property(),


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
    // TODO - rename to geoChanged
    cityChanged: function(newGeo) {
      var topiclist = Discourse.GeoTopic.geoTopicsForCity(newGeo);
      this.transitionToRoute('map.fromOneParam', topiclist);
    },
    // triggered by locations dropdown
    removeLocation: function(geoKey) {
        debugger;
        Discourse.GeoTopic.removeFromLlsGeoIndexList(geoKey);
      }
      // initiateAddLocation: function(newLocation) {
      //   this.send('showAddCityModal');
      // }

  },


  updateGeoKey: function() {
    var currentGeoKey = this.get('currentGeoKey');
    if (currentGeoKey ) {
      // and save currentGeoKey (currently local storage for is user closes and reopens page)
      Discourse.GeoTopic.setUserDefaultGeoKey(currentGeoKey);
    };
  }.observes('currentGeoKey'),

  // below updates the citySelectionItems
  // TODO *** fix urls - currently not being calculated..
  citySelectionItemsWithUrls: function() {
    var router = this.get('target');
    // below gets index list from local storage
    var selectionItems = Discourse.GeoTopic.getGeoIndexList(router);
    var currentGeoKey = this.get('currentGeoKey');
// checking selectionsItems length just in case a bad non-array object is passed
    if (currentGeoKey && selectionItems.length) {
      var currentCityInSelectionItems = selectionItems.findBy('value', currentGeoKey.bounds_value);
      if (!currentCityInSelectionItems) {
        selectionItems.pushObject(currentGeoKey);
        // lsGeoIndexListUpToDate = false;
      };
      // if (!lsGeoIndexListUpToDate) {
      Discourse.KeyValueStore.set({
        key: 'lsGeoIndexList',
        value: JSON.stringify(selectionItems)
      });

    };

    return selectionItems;
  }.property('currentGeoKey'),


});

// Discourse.MapFromOneParamController = Discourse.ObjectController.extend(Discourse.MapControllerMixin, {});
// Discourse.MapRootController = Discourse.ObjectController.extend(Discourse.MapControllerMixin, {});
