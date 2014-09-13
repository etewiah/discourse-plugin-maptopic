Discourse.Composer.reopen({

  createPost: function(opts) {
    var locationObject = this.get('locationObject');
    var dfr = this._super(opts);
    if (locationObject) {
      dfr.then(function(post_result) {
        var map_topic = Discourse.ajax('/location_topics/set_location', {
          data: {
            location: locationObject,
            // longitude: locationObject.longitude,
            // latitude: locationObject.latitude,
            topic_id: post_result.post.topic_id
          }
        });
        map_topic.then(function(set_location_result) {
          debugger;
          return post_result;
        });
        return map_topic;
      });
    }

    return dfr;
  }

});
