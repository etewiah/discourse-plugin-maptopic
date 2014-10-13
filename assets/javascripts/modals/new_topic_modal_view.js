Discourse.NewTopicModalView =  Discourse.ModalBodyView.extend({
  templateName: 'modal/new_topic',
  title: "New city",
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
