Discourse.Topic.reopen({
  // locationCount
  // Save any changes we've made to the model
  save: function() {
    // I set category id automatically based on location and this messes with that
    // will set title and category when setting/updating location
    return;
    // Don't save unless we can
    // if (!this.get('details.can_edit')) return;

    // return Discourse.ajax(this.get('url'), {
    //   type: 'PUT',
    //   data: { title: this.get('title'), category_id: this.get('category.id') }
    // });
  },

  hasLocation: function() {
    debugger;
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
