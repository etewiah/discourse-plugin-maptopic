Discourse.AddCityModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  needs: ['map'],
  cityName: "",
  readyToAdd: function() {
    if (Ember.isBlank(this.get('cityName'))) {
      return false;
    } else {
      return true;
    }
  }.property('cityName'),

  // defaultLocation: function() {
  //   // if this is a reply to a topic we will use that topics location
  //   if (this.get('model.topic.location')) {
  //     return this.get('model.topic.location');
  //   } else {
  //     // if user has browsed map, we will have a currentCity
  //     if (this.get('controllers.map.currentCity')) {
  //       var currentCity = this.get('controllers.map.currentCity');
  //       var selectionItems = Discourse.SiteSettings.maptopic.citySelectionItems;
  //       return selectionItems.findBy('value', currentCity);
  //     } else {
  //       // fuck it
  //       return {
  //         city_name: "madrid",
  //         longitude: "-3.7037902",
  //         latitude: "40.4167754"
  //       };
  //     }
  //   }
  // }.property('model'),


  actions: {
    addNewCity: function() {
      if (this.get('controllers.map')) {
        var mapController = this.get('controllers.map');
        var cityName = this.get('cityName');
        if (!Ember.isBlank(cityName)) {
          mapController.send('cityChanged', cityName);
          this.send('closeModal');
        }
      } else {
        debugger
      }
    },
    // locationSelected: function(latlng, geocodedLocation) {
    //   var locationObject = {
    //     formattedAddress: geocodedLocation.formatted_address,
    //     latitude: latlng.lat(),
    //     longitude: latlng.lng()
    //   }
    //   this.set('locationObject', locationObject);
    // },
    // addLocationToTopic: function() {
    //   if (Ember.isEmpty(this.get('locationObject.title'))) {
    //     return;
    //   };
    //   if (this.get('locationObject')) {
    //     this.set('model.locationObject', this.get('locationObject'));

    //   };
    //   // var self = this;
    //   // debugger;
    //   this.send('closeModal');

    // }
  }
});
