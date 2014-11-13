Discourse.GeoPlaceControlComponent = Ember.Component.extend({
  tagName: 'span',
  actions: {
    removePlace: function(){
      // var placeDetails = this.get('geoPlaceDetails');
      this.sendAction('removePlaceAction');
    },
    // searchForPlace: function(){
    //   this.sendAction('searchForPlaceAction');
    // },
    confirmPlaceDetails: function() {
      var confirmedDetails = this.get('geoPlaceDetails');
      this.sendAction('confirmPlaceDetailsAction', confirmedDetails);
    }
  },

  // didInsertElement: function() {
  //   this._super();
  // }

});
