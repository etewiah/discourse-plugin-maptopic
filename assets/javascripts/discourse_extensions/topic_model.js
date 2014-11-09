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
  // activePost: {},
  // locationMeta: function() {
  //   // TODO - set a locationMeta property for each topic
  //   // eventually all locationTopics will have to have this
  //   // as this object will come from db, probably should use snake case names - hot_from etc
  //   // debugger;
  //   if (this.get('geo')) {
  //     return this.get('geo');
  //   } 
  //   // else {
  //   //   return {
  //   //     displayString: 'Berlin',
  //   //     value: 'berlin',
  //   //     longitude: "13.4060912",
  //   //     latitude: "52.519171",
  //   //     hot_from: "",
  //   //     scope_type: "city"
  //   //   };
  //   // }
  // }.property('geo'),
  isLocationTopic: function() {
    if (this.get('location') || this.get('geo')) {
      return true;
    } else {
      return false;
    }
  }.property('location', 'geo'),

  // hasLocation: function() {
  //   if (this.get('location')) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }.property('location'),

  hasGeo: function() {
    if (this.get('geo')) {
      return true;
    } else {
      return false;
    }
  }.property('geo'),

  locationDetails: function() {
    if (this.get('location')) {
      return Discourse.Location.create(this.get('location'));
    } else {
      return undefined;
    }
  }.property("location"),

  // below gets fed to topics map component
  markers: function() {
    // var currentMarkerValuesOld = [];
    // var locations = this.get('locations');
    // debugger;
    // if (locations) {
    //   locations.forEach(function(loc) {
    //     var markerInfo = {
    //       context: 'topic_view',
    //       location: loc,
    //       location_id: loc.id
    //     };
    //     currentMarkerValuesOld.push(markerInfo);
    //   });
    // }
    var can_edit = Discourse.User.current() && Discourse.User.current().admin;
    // this.get('details.can_edit');
    var currentMarkerValues = [];
    var places = this.get('geo.places');
    if (places && places.sorted_ids) {
      places.sorted_ids.forEach(function(id){
        var markerInfo = {
          context: 'topic_view',
          location: places[id],
          location_id: String(id),
          can_edit: can_edit
        };
        // currently have some errors in db where duplicates have been saved
        // shouldn't need below once that is fixed
        if(!currentMarkerValues.findBy('location_id', String(id))){
          currentMarkerValues.push(markerInfo);
        }
      })
    };

    if (this.get('postStream.posts')) {
      var posts = this.get('postStream.posts');
      posts.forEach(function(p) {
        if (p.get('location')) {
          // var markerInfo = currentMarkerValues.findBy('location.id', p.get('location.id'));
          // above works but I suspect this is more efficient:
          var markerInfo = currentMarkerValues.findBy('location_id', p.get('location.id').toString());
          // currently some posts have locations that are not in the topic locations collection
          // so this is a workaround that should not be needed in the future:
          if (!markerInfo) {
            debugger;
            var loc = p.get('location');
            var markerInfo = {
              context: 'topic_view',
              location: loc,
              location_id: loc.id
            };
            currentMarkerValues.push(markerInfo);
          }

          if (!markerInfo.posts) {
            markerInfo.posts = [];
          }
          markerInfo.posts.pushObject(p);
          // debugger;

          // markerInfo.post = p;

          // if(p.post_number === 1){
          //   below would result in this.get('model.topic.markers.firstObject.topic.markers.firstObject.topic.markers.firstObject');
          //   markerInfo.topic = p.topic;
          // }
          // else{
          //   markerInfo.post = p;
          // }
          // currentMarkerValues.push(markerInfo);
        };

      });
    }

    return currentMarkerValues;
    // locationCount below is not accurate, just a value that increments each time
    // a new reply with a location is added (done in extension to composer model)
  }.property('locations', 'location', 'locationCount')

})
