Discourse.Composer.reopen({

  // only creation of new topic and editing of first post are valid for us
  // can_be_tagged: function(){
  //   return this.get("creatingTopic") || (this.get("editingPost") && this.get("editingFirstPost"));
  // }.property("creatingTopic", "editingPost", "editingFirstPost"),

  createPost: function(opts) {
    var locationObject = this.get('locationObject');
    debugger;
    var dfr = this._super(opts);
    if (locationObject) {
      dfr.then(function(post_result) {
        var map_topic = Discourse.ajax('/map_topic/set_location', {
          data: {
            location: locationObject,
            topic_id: post_result.post.topic_id
          }
        });
        map_topic.then(function() {
          return post_result;
        });
        return map_topic;
      });
    }

    return dfr;
  }

});
