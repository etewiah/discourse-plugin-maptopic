require("discourse/routes/application")["default"].reopen({
  actions: {
    showLocationSelectorModal: function(model) {
      // this is typically called by composer_controller with a model that includes relevant topic:
      Discourse.Route.showModal(this, 'selectLocationModal', model);
    }
  }
});
