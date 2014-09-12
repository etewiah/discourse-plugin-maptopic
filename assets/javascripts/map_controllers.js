Discourse.ConversationsController = Discourse.ObjectController.extend({
  needs: ['header', 'modal', 'composer', 'quote-button', 'search', 'topic-progress'],

  actions: {
    startConversation: function() {
      if (Discourse.User.current()) {
        var composerController = this.get('controllers.composer');
        var self = this;
        composerController.open({
          action: Discourse.Composer.CREATE_TOPIC,
          draftKey: "new_topic"
        }).then(function() {
          // composerController.appendText('slightly longer ...New event weee');
          // as this is about no gig in particular...:
          composerController.content.set('gig',{ id: 0});
          // debugger;
        });
      } else {
        this.send('showLogin');
      }
      //return true to bubble up to route...
      return false;
    }
  }

});
