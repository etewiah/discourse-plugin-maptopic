require("discourse/controllers/topic")["default"].reopen({
  needs: ['map'],

  topicShareLinks: function() {
    var link = this.get('url');
    if (link.indexOf("/") === 0) {
      link = window.location.protocol + "//" + window.location.host + link;
    }
    debugger;
    return Discourse.SiteSettings.share_links.split('|').map(function(i) {
      if (Discourse.ShareLink.supportedTargets.indexOf(i) >= 0) {
        return Discourse.ShareLink.create({
          target: i,
          link: link,
          topicTitle: this.get('title')
        });
      } else {
        return null;
      }
    }, this).compact();
  }.property('url'),

  setUserPreferredCity: function() {
    // TODO set currentCity for map here (and also as custom user field)
    // need to get geocoder working first though..
    if (this.get('location.city')) {
      var mapController = this.get('controllers.map');
      // debugger;
      // setting below should ensure that map.route uses this as default city..
      mapController.set('currentCity', this.get('location.city').toLowerCase());
    }
    // this._super();
  }.observes('location'),


  // below will trigger if a new location is set through select_location_modal
  startLocationPost: function() {
    if (this.get('model.locationObject')) {
      if (Discourse.User.current()) {

        var topic = this.get('model');
        if (topic) {
          var topicLocationCount = topic.get('locationCount') || 0;
          // below triggers recalculation of markers on a topic
          topic.set('locationCount', topicLocationCount + 1);
          // var pstrPosts = topic.get('postStream.posts');
          // var postInTopic = pstrPosts.findBy('id', post.id);
          // // this ensures location is available for map markers:
          // postInTopic.set('location', locationObject);
        }
        var update_location_endpoint = '/location_topics/set_location';
        var map_topic = Discourse.ajax(update_location_endpoint, {
          data: {
            location: topic.locationObject,
            // post_id: post.id,
            topic_id: topic.id
          },
          method: 'POST'
        });
        var locs = this.get('model.locations');
        locs.pushObject(topic.locationObject);
        var that = this;
        map_topic.then(function(result) {
          // debugger;
        });
        // TODO - handle errors



        // var composerController = this.get('controllers.composer');
        // var locationObject = this.get('model.locationObject');
        // var topic = this.get('model');
        // // var self = this;

        // var opts = {
        //   action: Discourse.Composer.REPLY,
        //   draftKey: topic.get('draft_key'),
        //   draftSequence: topic.get('draft_sequence'),
        //   topic: topic
        // };
        // composerController.open(opts).then(function() {
        //   composerController.content.set('locationObject', locationObject);
        // });
      } else {
        this.send('showLogin');
      }

    }
  }.observes('model.locationObject'),

  // contextChanged2: function() {
  //   debugger;
  //   // this.set('controllers.search.searchContext', this.get('model.searchContext'));
  // }.observes('topic'),

  actions: {
    sharePopup: function(target, url) {
      window.open(url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=' + Discourse.ShareLink.popupHeight(target));
      return false;
    },
    // called when marker on topics map is clicked:
    showPlaceDetails: function(detailsForMarker) {
      // this.send('showLocationSelectorModal',detailsForMarker);
      this.send('showDiscourseModal', 'placeDetailsModal', detailsForMarker);
    },
    showLocationSelector: function() {
      if (Discourse.User.current()) {
        // below calls method defined in application_route
        this.send('showLocationSelectorModal', this.get('model'));
      } else {
        this.send('showLogin');
      }

    },
    // replyWithLocation: function(geocodedLocation, title) {
    // when a location is double clicked and 'go' is clicked on the resulting infowindow
    replyWithLocation: function(locationType, locationDetails, city, title) {
      if (locationType === "placeSearch") {
        // currently placeSearch is disabled within topic map so should not end up here
        debugger;
        var locationObject = Discourse.Location.locationFromPlaceSearch(locationDetails, city);
      } else if (locationType === "gmapLocation") {
        var locationObject = Discourse.Location.locationFromGmap(locationDetails);
        locationObject.title = title;
      } else {
        debugger;
      }

      this.send('replyWithLocationObject', locationObject);
      // if (Discourse.User.current()) {
      //   var composerController = this.get('controllers.composer');
      //   var topic = this.get('model');
      //   // var self = this;

      //   var opts = {
      //     action: Discourse.Composer.REPLY,
      //     draftKey: topic.get('draft_key'),
      //     draftSequence: topic.get('draft_sequence'),
      //     topic: topic
      //   };

      //   composerController.open(opts).then(function() {
      //     composerController.content.set('locationObject', locationObject);
      //   });
      // } else {
      //   this.send('showLogin');
      // }
      //return true to bubble up to route...
      return false;
    },
    replyWithLocationObject: function(locationObject) {
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
