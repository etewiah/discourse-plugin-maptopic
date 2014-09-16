// Discourse.Composer.reopen({
require("discourse/controllers/composer")["default"].reopen({
  setLocationPrompt: function() {
    if (this.get('model.locationObject')) {
      return " Change location";
    } else {
      return " Associate with a location";
    };
  }.property('model.locationObject'),
  locationTitle: function() {
    if (this.get('model.locationObject')) {
      return "This topic is associated with ' " + this.get('model.locationObject.title') + " '";
    } else {
      return "This topic is not associated with a location.";
    };
  }.property('model.locationObject.title'),
  actions: {
    showLocationSelector: function() {
      this.send('showLocationSelectorModal', this.get('model'));

    }
  }
});
