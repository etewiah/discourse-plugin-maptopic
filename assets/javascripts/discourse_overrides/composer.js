// Discourse.Composer.reopen({
require("discourse/controllers/composer")["default"].reopen({
  actions: {
    addMapReference: function() {
      debugger;
        this.set('controllers.modal.modalClass', 'edit-category-modal full');
        this.set('controllers.modal.title', "Select Loc");

        this.send('showModal');
      // Discourse.Route.showModal(this, 'createGig');

    }
  }
});
