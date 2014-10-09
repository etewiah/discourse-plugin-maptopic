Discourse.PlaceDetailsModalView =  Discourse.ModalBodyView.extend({
  templateName: 'modal/place_details',
  title: "Place Details",
  // classNames: ['create-account'],

  // _setup: function() {
  //   // allows the submission the form when pressing 'ENTER' on *any* text input field
  //   // but only when the submit button is enabled
  //   var PlaceDetailsController = this.get('controller');
  //   Em.run.schedule('afterRender', function() {
  //     $("input[type='text'], input[type='password']").keydown(function(e) {
  //       if (PlaceDetailsController.get('submitDisabled') === false && e.keyCode === 13) {
  //         debugger;
  //         PlaceDetailsController.send('addLocationToTopic');
  //       }
  //     });
  //   });
  // }.on('didInsertElement')
});
