Discourse.PlaceDetailsModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  needs: ['topic'],
  actions: {
    goToPost: function(post) {
      var topicController = this.get('controllers.topic');
      var postNumber =  post.get('post_number');
      topicController.set('currentPost', postNumber);
      // to do - ensure scroll to correct post:
      Discourse.URL.jumpToPost(postNumber);
      // this.set('model.activePost', post);
      this.send('closeModal');
    },
    replyWithLocation: function(locationObject){
      var topicController = this.get('controllers.topic');
      topicController.send('replyWithLocationObject', locationObject);
      this.send('closeModal');
    }

  },

  // didInsertElement: function() {
  //   debugger;
  //   // never triggered
  //   this._super();
  // },

});
