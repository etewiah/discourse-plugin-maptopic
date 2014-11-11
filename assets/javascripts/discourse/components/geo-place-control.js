Discourse.GeoPlaceControlComponent = Ember.Component.extend({
  tagName: 'span',
  actions: {
    removePlace: function(){
      // var placeDetails = this.get('googlePlaceDetails');
      this.sendAction('removePlaceAction');
    },
    // searchForPlace: function(){
    //   this.sendAction('searchForPlaceAction');
    // },
    confirmPlaceDetails: function() {
      debugger;
      var confirmedDetails = this.get('googlePlaceDetails');
      // todo - get updated form data
      this.sendAction('confirmPlaceDetailsAction', confirmedDetails);
    }
  },


  // placeDetailsConfirmed: function() {
  //   // debugger;
  //   return false;
  // }.property('googlePlaceDetails', 'googlePlace'),
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


  didInsertElement: function() {
    this._super();

  }



});
