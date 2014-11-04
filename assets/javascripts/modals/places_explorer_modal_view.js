Discourse.PlacesExplorerModalView =  Discourse.ModalBodyView.extend({
  templateName: 'modal/places_explorer',
  title: ""
  // title: function(){
  //   return this.get('controller.content.clickedLocation.formatted_address') || "Explore";
  // }.property()

});
