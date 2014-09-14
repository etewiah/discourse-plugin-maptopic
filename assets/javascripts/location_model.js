Discourse.Location = Discourse.Model.extend({
  markers: function() {
    debugger;
    var currentMarkerValues = [];
    var longitude = this.get('longitude');
    var latitude = this.get('latitude');

    if (latitude && latitude != "unknown") {
      var latLngValue = {
        latitude: latitude,
        longitude: longitude,
        // title: show_time.title,
        start_time_string: this.get('start_time_string'),
        title: this.get('title'),
        venueAddress: this.get('venue_address'),
        venueName: this.get('venue_name')

      };
      currentMarkerValues.push(latLngValue);
    }
    return currentMarkerValues;
  }.property('longitude'),

  // uppercased_title: function() {
  //   return this.get('title').toUpperCase();
  // }.property(),

  // capitalized_venue_address: function() {
  //   if (this.get('venue_address')) {
  //     return this.get('venue_address').capitalize();
  //   }
  // }.property('venue_address'),


  // capitalized_city: function() {
  //   if (this.get('city')) {
  //     return this.get('city').capitalize();
  //   }
  // }.property('city')
});