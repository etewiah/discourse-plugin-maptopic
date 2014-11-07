// https://github.com/silviomoreto/bootstrap-select/blob/master/bower.json
// http://tympanus.net/codrops/2012/10/04/custom-drop-down-list-styling/
Discourse.GeoPlaceControlComponent = Ember.Component.extend({
  tagName: 'span',
  actions: {
    searchForPlace: function(){
      this.sendAction('searchForPlaceAction');
    },
    confirmPlaceDetails: function() {
      var confirmedDetails = this.get('googlePlaceDetails');
      // todo - get updated form data
      this.sendAction('confirmPlaceDetailsAction', confirmedDetails);
    },
    editPlaceDetails: function() {
      debugger;
    },
  },
  placeDetailsConfirmed: function() {
    // debugger;
    return false;
  }.property('googlePlaceDetails', 'googlePlace'),
  placePhotos: function() {
    var placePhotos = [];
    var photos = this.get('googlePlaceDetails.photos');
    if (photos && photos.length > 0) {
      var photoUrl = photos[0].getUrl({
        'maxWidth': 150,
        'maxHeight': 150
      })
      placePhotos.push({
        "url": photoUrl
      });
    }
    return placePhotos
  }.property('googlePlaceDetails'),
  // resortSelectionItems: function() {
  //   var selectionItems = this.get('selectionItems');
  //   if (selectionItems) {
  //     var selectionItemsWithoutNcPrompt = selectionItems.rejectBy('value', 'new_city');
  //     var sortedSelectionItems = selectionItemsWithoutNcPrompt.sortBy('value');
  //     sortedSelectionItems.push({
  //       displayString: "new location",
  //       value: "new_city"
  //     })
  //     this.set('sortedSelectionItems', sortedSelectionItems);
  //     // this.set
  //   }
  // }.observes('selectionItems.@each').on('init'),

  didInsertElement: function() {
    this._super();

  }



});
