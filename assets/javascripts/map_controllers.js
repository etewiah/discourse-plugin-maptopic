// Discourse.MapControllerMixin = Em.Mixin.create({
Discourse.MapFromOneParamController = Discourse.ObjectController.extend({
  needs: ['composer','map'],

  actions: {
    // triggered by start conversation button
    showNewTopicModal: function(topicType) {
      if (!Discourse.User.current()) {
        this.send('showLogin');
        return;
      }
      var geo = {};
      var currentGeoKey = this.get('controllers.map.currentGeoKey');
      currentGeoKey.capability = topicType;


      // in future might allow country bounds etc..
      var currentCitySelection = this.get('controllers.map.currentCitySelection');

      // geo.bounds_value = currentCitySelection.value.toLowerCase();
      // geo.bounds_type = "city";
      // geo.bounds_range = 20;
      // geo.latitude = currentCitySelection.latitude
      // geo.longitude = currentCitySelection.longitude
      // geo.city_lower = currentCitySelection.value.toLowerCase();
      // // geo.country_lower = geo_key.country_lower
      // geo.display_name = currentCitySelection.displayString;
      // geo.capability = topicType;
      this.send('showDiscourseModal', 'newTopicModal', currentGeoKey);
    },
    // had meant to show topic details next to index map - might come back to this
    // showPost: function(){

    //   var detailedTopic = Discourse.Topic.find(this.get('model.topics.firstObject.id'),{});
    //   var that = this;
    //   detailedTopic.then(function (result) {
    //     that.set('selectedTopic',result);
    //   });
    // },

    // can be triggered by clicking on infowindow after either doubleclicking map
    // use hovering over marker from places search
    startLocationTopic: function(locationType, locationDetails, city, title) {
      if (!Discourse.User.current()) {
        this.send('showLogin');
        return;
      }

      if (locationType === "placeSearch") {
        var locationObject = Discourse.Location.locationFromPlaceSearch(locationDetails, city);
      } else if (locationType === "gmapLocation") {
        var locationObject = Discourse.Location.locationFromGmap(locationDetails);
        locationObject.title = title;
      }


      var geo = {};
      geo.initial_location = locationObject;
      // in future might allow country bounds etc..
      // var currentCitySelection = this.get('controllers.map.currentCitySelection');


      var currentGeoKey = this.get('controllers.map.currentGeoKey');
      currentGeoKey.initial_location = locationObject;
      currentGeoKey.capability = "info";

      // geo.bounds_value = currentCitySelection.value.toLowerCase();
      // geo.bounds_type = "city";
      // geo.bounds_range = 20;
      // geo.latitude = currentCitySelection.latitude
      // geo.longitude = currentCitySelection.longitude
      // geo.city_lower = currentCitySelection.value.toLowerCase();
      // // geo.country_lower = geo_key.country_lower
      // geo.display_name = currentCitySelection.displayString;
      // geo.capability = "info";
      this.send('showDiscourseModal', 'newTopicModal', currentGeoKey);

      //return true to bubble up to route...
      return false;
    },
    initiateAddLocationToTopic: function() {
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
    var title = "What's being said about " + this.get('content.geo').capitalize();
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
    if (this.get('content.geo')) {
      return "Questions regarding " + this.get('content.geo').capitalize();
    };
  }.property('content.geo'),
  markers: function() {
    var geo_conversations = this.get('content.geo_conversations');
    var currentMarkerValues = [];
    // chapuzo to ensure I maximise no of markers on index page
    // will include posts in topic...
    geo_conversations.forEach(function(t) {
      if (t.primary_location) {
        var markerInfo = {
          // context: 'index_view',
          topic: t.topic,
          location: t.primary_location
        };
        currentMarkerValues.push(markerInfo);
      } else {}
      // p.user = users[p.user_id];
    });
    return currentMarkerValues;
  }.property('content'),
  otherTopics: function() {
    var other_conversations = this.get('content.other_conversations');
    var otherTopics = [];
    other_conversations.forEach(function(t) {
      var topicObject = Discourse.Topic.create(t.topic);
      // basic-topic-list needs fancy_title
      topicObject.set('fancy_title', topicObject.get('title'));
      otherTopics.push(topicObject);
    });
    return otherTopics;
  }.property('content'),
  cityQuestions: function() {
    var topics = this.get('content.geo_conversations');
    var cityQuestions = [];
    topics.forEach(function(t) {
      if (t.capability === "question") {
        var topicObject = Discourse.Topic.create(t.topic);
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
    // initiateAddLocation: function(newLocation) {
    //   this.send('showAddCityModal');
    // }

  },



  // currentCitySelection: function() {
  //   var currentCity = this.get('currentCity') || Discourse.SiteSettings.maptopic.defaultCityName;
  //   return this.get('citySelectionItemsWithUrls').findBy('value', currentCity);
  // }.property('currentCity', 'citySelectionItemsWithUrls'),


  // below updates the citySelectionItems
  citySelectionItemsWithUrls: function() {
    var router = this.get('target');
    var selectionItems = Discourse.GeoTopic.getGeoIndexList(router);
    //     var lsGeoIndexListUpToDate = true;
    //     var lsGeoIndexList = Discourse.KeyValueStore.get('lsGeoIndexList');
    //     if (lsGeoIndexList) {
    //       var selectionItems = JSON.parse(lsGeoIndexList);
    //     } else {
    //       lsGeoIndexListUpToDate = false;
    // // todo - get from server
    //       var selectionItems = Discourse.SiteSettings.maptopic.citySelectionItems;
    //       selectionItems.forEach(function(item) {
    //         item.url = this.get('target').generate('map.fromOneParam', {
    //           city: item.value
    //         });
    //       }, this);

    //     }
    var currentCitySelection = this.get('currentCitySelection');
    var currentCityInSelectionItems = selectionItems.findBy('value', currentCitySelection.value);
    if (!currentCityInSelectionItems) {
      debugger;
      selectionItems.pushObject(currentCitySelection);
      // lsGeoIndexListUpToDate = false;
    };
    // if (!lsGeoIndexListUpToDate) {
    Discourse.KeyValueStore.set({
      key: 'lsGeoIndexList',
      value: JSON.stringify(selectionItems)
    });
    // };
    return selectionItems;
  }.property('currentCitySelection'),


});

// Discourse.MapFromOneParamController = Discourse.ObjectController.extend(Discourse.MapControllerMixin, {});
// Discourse.MapRootController = Discourse.ObjectController.extend(Discourse.MapControllerMixin, {});
