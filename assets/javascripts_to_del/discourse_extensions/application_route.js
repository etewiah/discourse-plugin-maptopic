require("discourse/routes/application")["default"].reopen({
  actions: {
    // modal functions are called here as they have access to route object through 'this'
    showDiscourseModal: function(modalName, model) {
      Discourse.Route.showModal(this, modalName, model);
    },
    showLocationSelectorModal: function(model) {
      // this is typically called by composer_controller with a model that includes relevant topic:
      Discourse.Route.showModal(this, 'selectLocationModal', model);
    },
    showAddCityModal: function(model) {
      // this is typically called by map_controller:
      Discourse.Route.showModal(this, 'addCityModal', null);
    },
    // showModalWithController: function(name, model, controller) {
    //   debugger;
    //   this.controllerFor('modal').set('modalClass', null);
    //   this.render(name, {
    //     into: 'modal',
    //     outlet: 'modalBody',
    //     controller: controller
    //   });
    //   if (model) {
    //     controller.set('model', model);
    //   }
    //   if (controller && controller.onShow) {
    //     controller.onShow();
    //   }
    //   controller.set('flashMessage', null);
    // },
    // adaptation of showModal above would work but would be a bit ugly...
    // showModal: function(router, name, model) {
    //   router.controllerFor('modal').set('modalClass', null);
    //   router.render(name, {
    //     into: 'modal',
    //     outlet: 'modalBody'
    //   });
    //   var controller = router.controllerFor(name);
    //   if (controller) {
    //     if (model) {
    //       controller.set('model', model);
    //     }
    //     if (controller && controller.onShow) {
    //       controller.onShow();
    //     }
    //     controller.set('flashMessage', null);
    //   }
    // }
  }
});
