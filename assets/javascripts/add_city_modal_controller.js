Discourse.AddCityModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  needs: ['map'],
  cityName: "",
  onShow: function(){
    this.set('cityName','');
  },
  readyToAdd: function() {
    if (Ember.isBlank(this.get('cityName'))) {
      return false;
    } else {
      return true;
    }
  }.property('cityName'),



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
    }
  }
});
