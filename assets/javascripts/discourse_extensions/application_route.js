require("discourse/routes/application")["default"].reopen({
  actions: {
    // modal functions are called here as they have access to route object through 'this'
    showDiscourseModal: function (modalName, model) {
      Discourse.Route.showModal(this, modalName, model);
    },
    showLocationSelectorModal: function(model) {
      // this is typically called by composer_controller with a model that includes relevant topic:
      Discourse.Route.showModal(this, 'selectLocationModal', model);
    },
    showAddCityModal: function(model) {
      // this is typically called by map_controller:
      Discourse.Route.showModal(this, 'addCityModal', null);
    }
  }
});
