// Discourse.Composer.reopen({
require("discourse/controllers/composer")["default"].reopen({
  setLocationPrompt: function() {
    if (this.get('model.locationObject')) {
      return " - Change location";
    } else {
      return " - Associate with a location";
    };
  }.property('model.locationObject'),
  locationTitle: function() {
    if (this.get('model.locationObject')) {
      debugger;
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

require("discourse/routes/application")["default"].reopen({
  actions: {
    showLocationSelectorModal: function(model) {
      // this.set('controllers.modal.modalClass', 'edit-category-modal full');
      // this.set('controllers.modal.title', "Select Loc");

      // this.send('showModal');
      Discourse.Route.showModal(this, 'selectLocationModal', model);
      // this.controllerFor('editCategory').set('selectedTab', 'general');
    }
  }
});
