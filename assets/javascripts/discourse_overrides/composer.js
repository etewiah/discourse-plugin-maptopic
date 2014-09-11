// Discourse.Composer.reopen({
// require("discourse/controllers/composer")["default"].reopen({
require("discourse/routes/application")["default"].reopen({
  actions: {
    addMapReference: function() {
      // debugger;
        // this.set('controllers.modal.modalClass', 'edit-category-modal full');
        // this.set('controllers.modal.title', "Select Loc");

        // this.send('showModal');
      Discourse.Route.showModal(this, 'selectLocationModal');
      //  Discourse.Route.showModal(this, 'editCategory', Discourse.Category.create({
      //   color: 'AB9364', text_color: 'FFFFFF', group_permissions: [{group_name: 'everyone', permission_type: 1}],
      //   available_groups: Discourse.Site.current().group_names,
      //   allow_badges: true
      // }));
      // this.controllerFor('editCategory').set('selectedTab', 'general');

    }
  }
});
