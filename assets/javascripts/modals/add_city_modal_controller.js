Discourse.AddCityModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  needs: ['map'],
  locationName: "",
  onShow: function() {
    this.set('locationName', '');
    this.set('suggestedLocationName', null);
    this.set('validate', false);
    this.set('serverError', null);
  },
  // readyToAdd: function() {
  //   if (Ember.isBlank(this.get('locationName'))) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }.property('locationName'),
  locationNameValidation: function() {
    if (!this.get('validate')) {
      return;
    };
    if (this.get('serverError')) return Discourse.InputValidation.create({
      failed: true,
      reason: this.get('serverError')
    });
    // If blank, fail without a reason
    // if (this.blank('locationName')) return Discourse.InputValidation.create({
    //   failed: true
    // });
    // If too short
    if (this.blank('locationName') || this.get('locationName').length < 3) {
      return Discourse.InputValidation.create({
        failed: true,
        reason: "Location name has to be at least 3 characters long."
      });
    };

    // Looks good!
    return Discourse.InputValidation.create({
      ok: true,
      reason: "Location name looks good."
    });
  }.property('validate', 'locationName'),


  actions: {
    clearSuggestion: function() {
      this.set('suggestedLocationName', null);
      this.set('validate', false);
      this.set('serverError', null);
    },
    addNewCity: function() {
      if (this.get('suggestedLocationName')) {
        debugger;

        var mapController = this.get('controllers.map');
        mapController.send('cityChanged', this.get('suggestedLocationName'));
        this.send('closeModal');
        return;
      };
      var locationName = this.get('locationName');
      if (locationName.length < 3) {
        this.set('validate', true);
        return;
      }
      var geoKey = Discourse.ajax("/geo_topics/get_geo_key", {
        data: {
          geo: locationName
        }
      });
      var that = this;
      geoKey.then(function(result) {
        if (result.error) {
          that.set('serverError', "Sorry, could not find that location");
          that.set('validate', true);
          return;
        };
        console.log(that);
        if (that.get('locationName').toLowerCase() === result.display_name.toLowerCase()) {
          var mapController = that.get('controllers.map');
          mapController.send('cityChanged', that.get('locationName'));
          that.send('closeModal');
        } else {
          that.set('suggestedLocationName', result.display_name);
        };
      })

      // if (this.get('controllers.map')) {


      //   // var locationName = this.get('locationName');
      //   // if (!Ember.isBlank(locationName)) {
      //   //   mapController.send('cityChanged', locationName);
      //   //   this.send('closeModal');
      //   // }
      // } else {
      //   debugger
      // }
    }
  }
});
