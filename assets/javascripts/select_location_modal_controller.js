Discourse.SelectLocationModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  needs: ['map'],

  // readyToSelect: function() {
  //   if (this.get('locationObject.title')) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }.property('locationObject.title'),

  defaultLocation: function() {
    if (this.get('model.locationObject')) {
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
  }.property('model', 'model.locationObject'),


  actions: {
    // both topic and composer controllers are set to respond to 
    // locationObject being changed on their model

    // below moved into selectable map:
    // locationSelected: function(latlng, geocodedLocation) {
    //   var locationObject = Discourse.Location.locationFromGmap(geocodedLocation);
    //   this.set('locationObject', locationObject);
    // },
    // called when i select infowindow from search result - TODO - allow editing of item in infowindow
    // locationFinalized: function(placeSearchResult, city) {
    //   var locationObject = Discourse.Location.locationFromPlaceSearch(placeSearchResult, city);
    //   this.set('model.locationObject', locationObject);
    //   this.send('closeModal');
    // },
    addLocationToTopic: function(locationObject) {
      this.set('model.locationObject', locationObject);
      this.send('closeModal');
    }
  }
});
