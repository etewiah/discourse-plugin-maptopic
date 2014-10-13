Discourse.NewTopicModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  // topicTitle: "",
  onShow: function() {
    this.set('topicTitle', '');
  },
  readyToAdd: function() {
    if (Ember.isBlank(this.get('topicTitle'))) {
      return false;
    } else {
      return true;
    }
  }.property('topicTitle'),



  actions: {
    createNewTopic: function() {
      var opts = {
        action: "createTopic",
        draftKey: "new_topic",
        title: "a long enough title to please...",
        reply: "this can probably contain some html..."
      };
      // opts.action = "CREATE_TOPIC";
      var composerModel = Discourse.Composer.create();
      composerModel.open(opts);
      // setting below ensures composerModel sets geo object on server after creation..
      // composerModel.set('geo', this.get('model.currentCitySelection'));

      // var st = composerModel.createPost()
      // composerModel.save will call createPost on itself..
      var self = this;
      return composerModel.save({
        imageSizes: {},
        editReason: null
      }).then(function(post_result) {
        var geo = self.get('model.currentCitySelection');
        debugger;

        var set_geo_endpoint = '/location_posts/set_geo';
        var map_topic = Discourse.ajax(set_geo_endpoint, {
          data: {
            geo: geo,
            // longitude: locationObject.longitude,
            post_id: post_result.post.id,
            topic_id: post_result.post.topic_id
          },
          method: 'POST'

        });
        map_topic.then(function(set_geo_result) {
          debugger;
          Discourse.URL.routeTo(post_result.post.get('url'));

          // return post_result;
        });
        // return map_topic;


        self.send('closeModal');
        // If we replied as a new topic successfully, remove the draft.
        // if (self.get('replyAsNewTopicDraft')) {
        //   self.destroyDraft();
        // }

        // opts = opts || {};
        // self.close();

        // var currentUser = Discourse.User.current();
        // if (composerModel.get('creatingTopic')) {
        //   currentUser.set('topic_count', currentUser.get('topic_count') + 1);
        // } else {
        //   currentUser.set('reply_count', currentUser.get('reply_count') + 1);
        // }

        // if ((!composerModel.get('replyingToTopic')) || (!Discourse.User.currentProp('disable_jump_reply'))) {
        //   Discourse.URL.routeTo(opts.post.get('url'));
        // }
      }, function(error) {
        debugger;
        composerModel.set('disableDrafts', false);
        bootbox.alert(error);
      });


      // if (this.get('controllers.map')) {
      //   var mapController = this.get('controllers.map');
      //   var topicTitle = this.get('topicTitle');
      //   if (!Ember.isBlank(topicTitle)) {
      //     mapController.send('cityChanged', topicTitle);
      //     this.send('closeModal');
      //   }
      // } else {
      //   debugger
      // }
    }
  }
});
