Discourse.PlacesExplorerModalView = Discourse.ModalBodyView.extend({
  templateName: 'modal/places_explorer',
  // title: ""
  title: function() {
    var context = this.get('controller.content.context');
    if (context === "topic_map") {
      return "Add a place";
    } else {
      return "Start a new conversation";
    };
    // return this.get('controller.content.clickedLocation.formatted_address') || "Explore";
  }.property()

});
