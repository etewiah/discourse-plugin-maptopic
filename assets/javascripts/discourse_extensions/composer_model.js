Discourse.Composer.reopen({
  getCookedHtml: function() {
    // original assumed wmd-preview would exist so had to over-write it
    if ($('#wmd-preview').html()) {
      return $('#wmd-preview').html().replace(/<span class="marker"><\/span>/g, '');
    } else {
      return this.get('reply');
    }
  },


  editPost: function(opts) {
    var locationObject = this.get('locationObject');
    // when replying to a topic, this will be available:
    var topic = this.get('topic');
    var post = this.get('post');

    var locationChanged = false;
    if (post.location) {
      locationChanged = post.location.latitude !== locationObject.latitude || post.location.longitude !== locationObject.longitude;
    } else {
      // if post does not have a location but a locationObject has been set
      // location has changed
      if (locationObject) {
        locationChanged = true;
      };
    }
    if (locationChanged) {
      // dfr.then(function(post_result) {
      if (topic) {
        var topicLocationCount = topic.get('locationCount') || 0;
        // below triggers recalculation of markers on a topic
        topic.set('locationCount', topicLocationCount + 1);
        var pstrPosts = topic.get('postStream.posts');
        var postInTopic = pstrPosts.findBy('id', post.id);
        // this ensures location is available for map markers:
        postInTopic.set('location', locationObject);
      }
      // set_location below can figure out if topic should be updated too:
      var update_location_endpoint = '/location_posts/set_location';

      // if the post is a reply, we associate location to post rather than topic..
      // if (post.post_number > 1) {
      //   update_location_endpoint = '/location_posts/set_location';
      // }
      var map_topic = Discourse.ajax(update_location_endpoint, {
        data: {
          location: locationObject,
          // longitude: locationObject.longitude,
          post_id: post.id,
          topic_id: topic.id
        },
        method: 'POST'

      });
      // need to make sure map_topic update happens first - this._super will then refresh the post object
      // after I have set the new locationObject on the server
      var dfr = this._super(opts);
      // dfr.then(function(result){
      //   map_topic.then(function(update_location_result) {
      //     // var dfr = that._super(opts);
      //     // return dfr;
      //     return update_location_result;
      //   });
      //   return map_topic;
      // });
      return dfr;
      // return map_topic;
      // });
    } else {
      var dfr = this._super(opts);
      return dfr;
    }

  },
  createPost: function(opts) {
    var locationObject = this.get('locationObject');
    var geo = this.get('geo');
    // when replying to a topic, this will be available:
    var topic = this.get('topic');
    var dfr = this._super(opts);
    //     if (geo) {
    //       dfr.then(function(post_result) {
    // debugger;

    //       });
    //     }
    //     else 
    if (locationObject) {
      dfr.then(function(post_result) {

        if (topic) {
          var topicLocationCount = topic.get('locationCount') || 0;
          // below triggers recalculation of markers on a topic
          topic.set('locationCount', topicLocationCount + 1);
          var pstrPosts = topic.get('postStream.posts');
          var lastPostInTopic = pstrPosts.findBy('id', post_result.post.id);
          // for replies, this ensures location is available for map markers:
          lastPostInTopic.set('location', locationObject);
        }
        // var set_location_endpoint = '/location_topics/set_location';
        // // if the post is a reply, we associate location to post rather than topic..
        // if (post_result.post.post_number > 1) {
        //   set_location_endpoint = '/location_posts/set_location';
        //   // debugger;
        // }

        // set_location below can figure out if topic should be updated too:
        var set_location_endpoint = '/location_posts/set_location';

        var map_topic = Discourse.ajax(set_location_endpoint, {
          data: {
            location: locationObject,
            // longitude: locationObject.longitude,
            post_id: post_result.post.id,
            topic_id: post_result.post.topic_id
          },
          method: 'POST'

        });
        map_topic.then(function(set_location_result) {
          debugger;
          // TODO - set location object so newly created topics have a map...
          // though not entirely convinced that will work as the post_result isn't
          // passed 
          return post_result;
        });
        return map_topic;
      });
    }

    return dfr;
  }

});
