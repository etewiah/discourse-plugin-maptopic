Discourse.NewTopicModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  // topicTitle: "",
  onShow: function() {
    // this.set('topicTitle', '');
  },
  titlePrompt: function() {
    var topicType = this.get('model.capability');
    if (topicType && topicType === "question") {
      return "Your question";
    } else if (topicType && topicType === "info") {
      return "Conversation title";
    } else {
      debugger;
    };
  }.property('model.capability'),
  detailsPrompt: function() {
    var topicType = this.get('model.capability');
    if (topicType && topicType === "question") {
      return "Some details to help people answer your question better";
    } else if (topicType && topicType === "info") {
      return "The first post ( You can select places on the map later )";
    } else {
      debugger;
    };
  }.property('model.capability'),
  readyToAdd: function() {
    if (Ember.isBlank(this.get('topicTitle'))) {
      return false;
    } else {
      return true;
    }
  }.property('topicTitle'),


  detailsValidation: function() {
    if (!this.get('validate')) {
      return;
    };
    if (this.get('serverError')) return Discourse.InputValidation.create({
      failed: true,
      reason: this.get('serverError')

    });
    if (this.blank('topicDetails')) return Discourse.InputValidation.create({
      failed: true,
      reason: "Details have to be at least 10 characters long."

    });
    // If too short
    if (this.get('topicDetails').length < 10) {
      return Discourse.InputValidation.create({
        failed: true,
        reason: "Details have to be at least 10 characters long."
      });
    }

    // Looks good!
    return Discourse.InputValidation.create({
      ok: true,
      reason: ""
    });
  }.property('validate', 'topicDetails','serverError'),
  titleValidation: function() {
    if (!this.get('validate')) {
      return;
    };
    // If blank, fail without a reason
    if (this.blank('topicTitle')) return Discourse.InputValidation.create({
      failed: true
    });
    // If too short
    if (this.get('topicTitle').length < 5) {
      return Discourse.InputValidation.create({
        failed: true,
        reason: "Title has to be at least 5 characters long."
      });
    }

    // Looks good!
    return Discourse.InputValidation.create({
      ok: true,
      reason: ""
    });
  }.property('validate', 'topicTitle'),

  actions: {
    createNewTopic: function() {

      if (this.get('topicTitle').length < 5 || this.get('topicDetails').length < 10) {
        this.set('validate', true);
        return;
      }

      var reply = this.get('topicDetails'),
        title = this.get('topicTitle');
      var opts = {
        action: "createTopic",
        draftKey: "new_topic",
        title: title,
        reply: reply
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
        var geo = self.get('model');
        // debugger;

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
        self.set('serverError',error);
        self.set('validate', true);
        // todo - handle
        // "Body is invalid; try to be a little more descriptive"
        // composerModel.set('disableDrafts', false);
        // bootbox.alert(error);
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
