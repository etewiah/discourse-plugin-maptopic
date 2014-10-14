Discourse.NewTopicModalView = Discourse.ModalBodyView.extend({
  templateName: 'modal/new_topic',
  title: function() {
      var topicType = this.controller.get('model.capability');
      var cityName = this.controller.get('model.display_name');

      if (topicType && topicType === "question") {
        return "Ask a Question regarding " + cityName;
      } else if (topicType && topicType === "info") {
        return "Share tips about " + cityName;
      } else {
        debugger;
      };
    }.property()
    // classNames: ['create-account'],

  // _setup: function() {
  //   // allows the submission the form when pressing 'ENTER' on *any* text input field
  //   // but only when the submit button is enabled
  //   var selectLocationController = this.get('controller');
  //   Em.run.schedule('afterRender', function() {
  //     $("input[type='text'], input[type='password']").keydown(function(e) {
  //       if (selectLocationController.get('submitDisabled') === false && e.keyCode === 13) {
  //         debugger;
  //         selectLocationController.send('addLocationToTopic');
  //       }
  //     });
  //   });
  // }.on('didInsertElement')
});
