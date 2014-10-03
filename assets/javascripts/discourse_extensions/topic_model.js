


// require("discourse/views/post-menu")["default"].reopen({

//       shouldRerenderPostlocationButton: Discourse.View.renderIfChanged("post.temporarily_hidden"),
//       buttonForPostlocation: function(post, buffer) {
//         // var direction = !!post.getWithDefault("temporarily_hidden", false) ? "down" : "up";
//         // return new Button("postlocation", "go_to_location", "chevron-up");
// debugger;
//         buffer.push('<button title="Mark this post as solving your initial question" data-action="correct">Mark as correct</button>');


//       },

//       clickPostlocation: function() {
//         Discourse.URL.jumpToPost(1);
//         debugger;
//         this.set('activePost', post);
//         // $("#post_" + this.get("post.post_number") + " .cooked").toggle();
//         // this.toggleProperty("post.temporarily_hidden");
//       }
//     });

// Discourse.Post.reopen({
//   // locationCount

//   hasLocation: function() {
//     if (this.get('location')) {
//       return true;
//     } else {
//       return false;
//     }
//   }.property()
// });

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
