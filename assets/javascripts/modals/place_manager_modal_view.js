Discourse.PlaceManagerModalView =  Discourse.ModalBodyView.extend({
  templateName: 'modal/place_manager',
  title: function(){
    return this.get('controller.content.location.title') || "Place Details";
    // if (this.get('controller.content.location.title')) {
    //   return
    // } else{};
  }.property()

});
