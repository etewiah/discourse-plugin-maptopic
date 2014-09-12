Discourse.SelectLocationModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {

  readyToSelect: function() {
    if(this.get('locationObject.title')){
      return true;
    }
    else{
      return false;
    }
  }.property( 'locationObject.title'),



  actions: {
    locationSelected: function(latlng, geocodedLocation) {
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

    }
  }
});
