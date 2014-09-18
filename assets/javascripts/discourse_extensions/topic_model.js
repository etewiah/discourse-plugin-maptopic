Discourse.Post.reopen({
  // locationCount

  hasLocation: function() {
    if (this.get('location')) {
      return true;
    } else {
      return false;
    }
  }.property()
});

Discourse.Topic.reopen({
  // locationCount

  hasLocation: function() {
    if (this.get('location')) {
      return true;
    } else {
      return false;
    }
  }.property('location'),

  locationDetails: function() {
    if (this.get('location')) {
      return Discourse.Location.create(this.get('location'));
    } else {
      return undefined;
    }
  }.property("location"),

  markers: function() {
    var currentMarkerValues = [];
    if (this.get('postStream.posts')) {
      var posts = this.get('postStream.posts');
      posts.forEach(function(p) {
        if (p.get('location')) {
          var markerInfo = {
            post: p,
            location: p.get('location')
          };
          currentMarkerValues.push(markerInfo);
        };

      });
    }


    if (this.get('location')) {

      // var longitude = this.get('location.longitude');
      // var latitude = this.get('location.latitude');

      // if (latitude && latitude != "unknown") {
      var markerInfo = {
        topic: this,
        location: this.get('location'),
        // latitude: latitude,
        // longitude: longitude,
        // // title: show_time.title,
        // start_time_string: this.get('start_time_string'),
        // title: this.get('title'),
        // venueAddress: this.get('venue_address'),
        // venueName: this.get('venue_name')

      };
      currentMarkerValues.push(markerInfo);
      // }
    }
    return currentMarkerValues;
    // locationCount below is not accurate, just a value that increments each time
    // a new reply with a location is added (done in extension to composer model)
  }.property('location','locationCount')
  // below is for showing an excerpt in the list of location topics
  // excerptNotEmpty: Em.computed.notEmpty('excerpt'),
  // // hasExcerpt: Em.computed.and('pinned', 'excerptNotEmpty'),
  // // hasExcerpt: Em.computed.and('haslocation', 'excerptNotEmpty'),
  // hasExcerpt: function() {
  //   if (this.get('excerptNotEmpty')) {
  //     // return (this.get('location_id') > 1);
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }.property('location_id', 'excerptNotEmpty'),

})
