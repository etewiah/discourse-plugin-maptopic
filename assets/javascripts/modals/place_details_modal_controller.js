Discourse.PlaceDetailsModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
  // needs: ['map'],

  didInsertElement: function() {
        debugger;

    this._super();
    debugger;    
  },

  postsForPlace: function(){
    debugger;
    return [];
  }.property('model')

  // defaultLocation: function() {
  //   if (this.get('model.locationObject')) {
  //     return this.get('model.locationObject');
  //   }
  //   // if this is a reply to a topic we will use that topics location
  //   else if (this.get('model.topic.location')) {
  //     return this.get('model.topic.location');
  //   } else {
  //     // if user has browsed map, we will have a currentCity
  //     if (this.get('controllers.map.currentCity')) {
  //       var currentCity = this.get('controllers.map.currentCity');
  //       var selectionItems = Discourse.SiteSettings.maptopic.citySelectionItems;
  //       return selectionItems.findBy('value', currentCity);
  //     } else {
  //       // fuck it
  //       return {
  //         city_name: "madrid",
  //         longitude: "-3.7037902",
  //         latitude: "40.4167754"
  //       };
  //     }
  //   }
  // }.property('model', 'model.locationObject'),


  // actions: {
  //   addLocationToTopic: function(locationObject) {
  //     this.set('model.locationObject', locationObject);
  //     this.send('closeModal');
  //   }
  // }
});
