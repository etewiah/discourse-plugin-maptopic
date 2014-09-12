require("discourse/routes/application")["default"].reopen({
  actions: {
    showLocationSelectorModal: function(model) {
      Discourse.Route.showModal(this, 'selectLocationModal', model);
    }
  }
});
