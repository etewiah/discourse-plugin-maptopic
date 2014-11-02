Discourse.PlacesExplorerModalView =  Discourse.ModalBodyView.extend({
  templateName: 'modal/places_explorer',
  title: function(){
    return this.get('controller.content.location.title') || "Explore";
    // if (this.get('controller.content.location.title')) {
    //   return
    // } else{};
  }.property()

});
