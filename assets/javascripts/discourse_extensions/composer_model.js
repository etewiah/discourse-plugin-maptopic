Discourse.Composer.reopen({

  createPost: function(opts) {
    var locationObject = this.get('locationObject');
    var dfr = this._super(opts);
    if (locationObject) {
      dfr.then(function(post_result) {
        var set_location_endpoint = '/location_topics/set_location';
        // if the post is a reply, we associate location to post rather than topic..
        if (post_result.post.post_number > 1) {
          set_location_endpoint = '/location_posts/set_location';
          debugger;
        }
        var map_topic = Discourse.ajax(set_location_endpoint, {
          data: {
            location: locationObject,
            // longitude: locationObject.longitude,
            post_id: post_result.post.id,
            topic_id: post_result.post.topic_id
          }
        });
        map_topic.then(function(set_location_result) {
          return post_result;
        });
        return map_topic;
      });
    }

    return dfr;
  }

});
