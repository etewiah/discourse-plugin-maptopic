Discourse.NewTopicModalView = Discourse.ModalBodyView.extend({
  templateName: 'modal/new_topic',
  title: function() {
    var topicType = this.get('controller.model.capability');
    if (this.get('controller.model.initial_location.title')) {
      var name = this.get('controller.model.initial_location.title');
    } else {
      var name = this.get('controller.model.display_name');
    };
    // debugger;
    if (topicType && topicType === "question") {
      return "Ask for information regarding " + name;
    } else if (topicType && topicType === "info") {
      return "Start a conversation about " + name;
    } else {
      debugger;
    };
  }.property(),
  // below from composer view

  // titleValidation: function() {
  //   var titleLength = 0,
  //     missingChars = 0,
  //     reason;
  //   // var titleLength = this.get('model.titleLength'),
  //   //   missingChars = this.get('model.missingTitleCharacters'),
  //   //   reason;
  //   if (titleLength < 1) {
  //     reason = I18n.t('composer.error.title_missing');
  //   } else
  //   if (missingChars > 0) {
  //     reason = I18n.t('composer.error.title_too_short', {
  //       min: this.get('model.minimumTitleLength')
  //     });
  //   } else if (titleLength > Discourse.SiteSettings.max_topic_title_length) {
  //     reason = I18n.t('composer.error.title_too_long', {
  //       max: Discourse.SiteSettings.max_topic_title_length
  //     });
  //   }

  //   if (reason) {
  //     return Discourse.InputValidation.create({
  //       failed: true,
  //       reason: reason
  //     });
  //   }
  // }.property('model.titleLength', 'model.missingTitleCharacters', 'model.minimumTitleLength'),

  // replyValidation: function() {
  //   debugger;
  //   var replyLength = this.get('model.replyLength'),
  //     missingChars = this.get('model.missingReplyCharacters'),
  //     reason;
  //   if (replyLength < 1) {
  //     reason = I18n.t('composer.error.post_missing');
  //   } else if (missingChars > 0) {
  //     reason = I18n.t('composer.error.post_length', {
  //       min: this.get('model.minimumPostLength')
  //     });
  //   }

  //   if (reason) {
  //     return Discourse.InputValidation.create({
  //       failed: true,
  //       reason: reason
  //     });
  //   }
  // }.property('model.reply', 'model.replyLength', 'model.missingReplyCharacters', 'model.minimumPostLength'),

});
