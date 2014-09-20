// Discourse.Composer.reopen({
require("discourse/controllers/composer")["default"].reopen({
  setLocationPrompt: function() {
    if (this.get('model.locationObject')) {
      return " change location";
    } else {
      return " select a location";
    };
  }.property('model.locationObject'),
  locationTitle: function() {
    if (this.get('model.locationObject')) {
      return "associated location is: ' " + this.get('model.locationObject.title') + " '";
    } else {
      return "not associated with a location.";
    };
  }.property('model.locationObject.title'),
  actions: {
    showLocationSelector: function() {
      this.send('showLocationSelectorModal', this.get('model'));

    }
  }
});
