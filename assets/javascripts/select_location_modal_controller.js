Discourse.SelectLocationModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  needs: ['map'],

  readyToSelect: function() {
    if (this.get('locationObject.title')) {
      return true;
    } else {
      return false;
    }
  }.property('locationObject.title'),

  defaultLocation: function() {
    if (this.get('model.locationObject')) {
    debugger;
      return this.get('model.locationObject');
    }
    // if this is a reply to a topic we will use that topics location
    else if (this.get('model.topic.location')) {
      return this.get('model.topic.location');
    } else {
      // if user has browsed map, we will have a currentCity
      if (this.get('controllers.map.currentCity')) {
        var currentCity = this.get('controllers.map.currentCity');
        var selectionItems = Discourse.SiteSettings.maptopic.citySelectionItems;
        return selectionItems.findBy('value', currentCity);
      } else {
        // fuck it
        return {
          city_name: "madrid",
          longitude: "-3.7037902",
          latitude: "40.4167754"
        };
      }
    }
  }.property('model','model.locationObject'),


  actions: {
    locationSelected: function(latlng, geocodedLocation) {
      var locationObject = {
        formattedAddress: geocodedLocation.formatted_address,
        latitude: latlng.lat(),
        longitude: latlng.lng()
      }
      this.set('locationObject', locationObject);
    },
    // called when i
    locationFinalized: function(placeSearchResult) {
      var locationObject = Discourse.Location.locationFromGmapResult(placeSearchResult);
      this.set('model.locationObject', locationObject);
      this.send('closeModal');
    },
    addLocationToTopic: function() {
      if (Ember.isEmpty(this.get('locationObject.title'))) {
        return;
      };
      if (this.get('locationObject')) {
        this.set('model.locationObject', this.get('locationObject'));

      };
      this.send('closeModal');

    }
  }
});
