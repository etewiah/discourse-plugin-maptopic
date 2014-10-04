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

// below gets fed to topics map component
  markers: function() {
    var currentMarkerValues = [];
    if (this.get('postStream.posts')) {
      var posts = this.get('postStream.posts');
      posts.forEach(function(p) {
        if (p.get('location')) {
          var markerInfo = {
            // post: p,
            location: p.get('location')
          };
          if(p.post_number === 1){
            markerInfo.topic = p.topic;
          }
          else{
            markerInfo.post = p;
          }
          currentMarkerValues.push(markerInfo);
        };

      });
    }


    // if (this.get('location')) {
    //   var markerInfo = {
    //     topic: this,
    //     location: this.get('location'),
    //     // latitude: latitude,
    //     // longitude: longitude,
    //     // // title: show_time.title,
    //     // start_time_string: this.get('start_time_string'),
    //     // title: this.get('title'),
    //     // venueAddress: this.get('venue_address'),
    //     // venueName: this.get('venue_name')
    //   };
    //   currentMarkerValues.push(markerInfo);
    // }
    return currentMarkerValues;
    // locationCount below is not accurate, just a value that increments each time
    // a new reply with a location is added (done in extension to composer model)
  }.property('location','locationCount')

})
