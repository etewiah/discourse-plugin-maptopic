require("discourse/controllers/topic")["default"].reopen({
  needs: ['map'],

  topicShareLinks: function() {
    var link = this.get('url');
    if (link.indexOf("/") === 0) {
      link = window.location.protocol + "//" + window.location.host + link;
    }
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



  setUserPreferredGeoKey: function() {
    var currentGeoKey = this.get('model.geo');
    if (currentGeoKey) {

      // TODO - have displayString and value cols on geo_key correct to start with:
      currentGeoKey.displayString = currentGeoKey.display_name.capitalize();
      currentGeoKey.value = currentGeoKey.bounds_value.toLowerCase();
      var mapController = this.get('controllers.map');


      // could check to see if mapctrl already has correct value set:
      mapController.set('currentGeoKey', currentGeoKey);

      // below should really be geo.bounds_value but in the case of belfast
      // its wrong - should investigate
      // var boundsValue = geo.city_lower;

      // var mapController = this.get('controllers.map');
      // setting below should ensure that map.route uses this as default city..
      // mapController.set('currentCity', boundsValue);
    }
    // this._super();
  }.observes('model.geo'),


  // below will trigger if a new location is set through select_location_modal
  // name is misleading as there isn't a post  being created:
  startLocationPost: function() {
    if (this.get('model.locationObject')) {
      this.send('addPlace', this.get('model.locationObject'));
    }
  }.observes('model.locationObject'),

  // contextChanged2: function() {
  //   // this.set('controllers.search.searchContext', this.get('model.searchContext'));
  // }.observes('topic'),

  actions: {

    addPlace: function(locationObject) {
      if (Discourse.User.current()) {

        var topic = this.get('model');
        if (topic) {
          var topicLocationCount = topic.get('locationCount') || 0;
          // below triggers recalculation of markers on a topic
          topic.set('locationCount', topicLocationCount + 1);
        }
        // because no post is being created yet, only setting location on topic
        var update_location_endpoint = '/location_topics/set_location';
        var map_topic = Discourse.ajax(update_location_endpoint, {
          data: {
            location: locationObject,
            // post_id: post.id,
            topic_id: topic.id
          },
          method: 'POST'
        });

        // var locs = this.get('model.locations');
        // locs.pushObject(locationObject);

        var that = this;
        map_topic.then(function(result) {
          // topicLocationCount will trigger recalculation of markers
          // below ensures the new place is available for recalculation right away
          // var places = that.get('model.geo.places');
          that.set('model.geo.places', result);
        });
        // TODO - handle errors

      } else {
        this.send('showLogin');
      }
    },

    sharePopup: function(target, url) {
      window.open(url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=' + Discourse.ShareLink.popupHeight(target));
      return false;
    },
    // called when marker on topics map is clicked:
    showPlaceDetails: function(placeDetails) {
      placeDetails.map = placeDetails.map || this.get('model.geo.map');
      // this.send('showLocationSelectorModal',placeDetails);
      this.send('showDiscourseModal', 'placeDetailsModal', placeDetails);
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
    // when a location is double clicked and 'select' is clicked on the resulting infowindow
    showExplorerModalForTopic: function(locationInfo) {
      // var map = this.get('model.geo.map');
      locationInfo.context = "topic_map";
      this.send('showDiscourseModal', 'placesExplorerModal', locationInfo);
      //return true to bubble up to route...
      return false;
    },
    showEditorModalForTopic: function(locationInfo) {
      locationInfo.topic_id = this.get('model.id');
      locationInfo.map = locationInfo.map || this.get('model.geo.map');
      this.send('showDiscourseModal', 'placeManagerModal', locationInfo);
      //return true to bubble up to route...
      return false;
    },
    // triggered by places explorer
    addPlaceAction: function(locationObject) {
      this.send('addPlace', locationObject);
    },
    // triggered by clicking on search result infowindow 
    addPlaceFromSearchResult: function(searchResult, geo) {
      var locationObject = Discourse.Location.locationFromPlaceSearch(searchResult, "");
      this.send('addPlace', locationObject);

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
          composerController.set('content.locationObject', locationObject);
          // composerController.content.set('locationObject', locationObject);
        });
      } else {
        this.send('showLogin');
      }
      //return true to bubble up to route...
      return false;
    },

    removePlace: function(placeToRemove) {
      var geo_place_update = Discourse.ajax("/geo_topics/remove_geo_place", {
        data: {
          location_id: placeToRemove.location_id,
          topic_id: placeToRemove.topic_id
        },
        method: 'POST'
      });
      var that = this;
      geo_place_update.then(function(result) {
        that.set('model.geo.places', result.places);
      });
    },

    confirmPlaceDetails: function(confirmedDetails) {
      // var updatedPlace = Discourse.Location.geoPlaceFromGooglePlace(confirmedDetails)
      // updatedPlace.detailsConfirmed = true;
      confirmedDetails.status_flag = "details_confirmed";
      // http://stackoverflow.com/questions/25856959/parsing-json-with-jquery-turns-array-into-hash
      var confirmedDetailsJSON = JSON.stringify(confirmedDetails);
      // TODO - move below to model ovject

      var geo_place_update = Discourse.ajax("/geo_topics/update_geo_places", {
        data: {
          place: confirmedDetailsJSON,
          location_id: confirmedDetails.location_id,
          topic_id: this.get('model.id')
        },
        method: 'POST'
      });
      var that = this;
      geo_place_update.then(function(result) {
        that.set('model.geo.places', result.places);
      });
    }

  }
});
