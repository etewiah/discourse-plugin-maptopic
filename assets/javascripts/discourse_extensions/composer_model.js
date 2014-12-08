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
    var isChattyTopic = this.get('isChattyTopic');
    if (isChattyTopic) {
      var dfr = this.geoFriendlyCreatePost(opts);
    } else {
      var dfr = this._super(opts);
      // var dfr = this.geoFriendlyCreatePost(opts);
    };

    if (locationObject) {
      // when replying to a topic, this will be available:
      var topic = this.get('topic');

      dfr.then(function(post_result) {
        if (topic) {
          var topicLocationCount = topic.get('locationCount') || 0;
          // below triggers recalculation of markers on a topic
          topic.set('locationCount', topicLocationCount + 1);
          var pstrPosts = topic.get('postStream.posts');
          var lastPostInTopic = pstrPosts.findBy('id', post_result.post.id);
          // for replies, this ensures location is available for map markers:
          if (lastPostInTopic) {
            lastPostInTopic.set('location', locationObject);
          };
        }

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
          // TODO - set location object so newly created topics have a map...
          // though not entirely convinced that will work as the post_result isn't
          // passed 
          return post_result;
        });
        return map_topic;
      });
    }

    return dfr;
  },
  // Create a new Post - but without the redirection and Poststream shite
  geoFriendlyCreatePost: function(opts) {
    var post = this.get('post'),
      topic = this.get('topic'),
      currentUser = Discourse.User.current(),
      postStream = this.get('topic.postStream'),
      addedToStream = false;

    // Build the post object
    var createdPost = Discourse.Post.create({
      raw: this.get('reply'),
      title: this.get('title'),
      category: this.get('categoryId'),
      topic_id: this.get('topic.id'),
      is_warning: this.get('isWarning'),
      imageSizes: opts.imageSizes,
      cooked: this.getCookedHtml(),
      reply_count: 0,
      display_username: currentUser.get('name'),
      username: currentUser.get('username'),
      user_id: currentUser.get('id'),
      uploaded_avatar_id: currentUser.get('uploaded_avatar_id'),
      user_custom_fields: currentUser.get('custom_fields'),
      archetype: this.get('archetypeId'),
      post_type: Discourse.Site.currentProp('post_types.regular'),
      target_usernames: this.get('targetUsernames'),
      actions_summary: Em.A(),
      moderator: currentUser.get('moderator'),
      admin: currentUser.get('admin'),
      yours: true,
      newPost: true,
    });

    if (post) {
      createdPost.setProperties({
        reply_to_post_number: post.get('post_number'),
        reply_to_user: {
          username: post.get('username'),
          uploaded_avatar_id: post.get('uploaded_avatar_id')
        }
      });
    }

    // If we're in a topic, we can append the post instantly.
    // if (postStream) {
    //   // If it's in reply to another post, increase the reply count
    //   if (post) {
    //     post.set('reply_count', (post.get('reply_count') || 0) + 1);
    //     post.set('replies', []);
    //   }
    //   if (!postStream.stagePost(createdPost, currentUser)) {

    //     // If we can't stage the post, return and don't save. We're likely currently
    //     // staging a post.
    //     return;
    //   }
    // }

    var composer = this;
    var CLOSED = 'closed',
      SAVING = 'saving',
      OPEN = 'open',
      DRAFT = 'draft';

    return new Ember.RSVP.Promise(function(resolve, reject) {

      composer.set('composeState', SAVING);
      createdPost.save(function(result) {
        var saving = true;

        createdPost.updateFromJson(result);

        if (topic) {
          // It's no longer a new post
          createdPost.set('newPost', false);
          topic.set('draft_sequence', result.draft_sequence);
          topic.set('details.auto_close_at', result.topic_auto_close_at);
          // postStream.commitPost(createdPost);
          // below is my simple way of adding new post withouth postStream shebang..
          topic.post_stream.posts.pushObject(result);

          addedToStream = true;
        } else {
          // // We created a new topic, let's show it.
          // composer.set('composeState', CLOSED);
          // saving = false;

          // // Update topic_count for the category
          // var category = Discourse.Site.currentProp('categories').find(function(x) {
          //   return x.get('id') === (parseInt(createdPost.get('category'), 10) || 1);
          // });
          // if (category) category.incrementProperty('topic_count');
          // Discourse.notifyPropertyChange('globalNotice');
        }

        composer.clearState();
        composer.set('createdPost', createdPost);

        if (addedToStream) {
          composer.set('composeState', CLOSED);
        } else if (saving) {
          composer.set('composeState', SAVING);
        }


        Discourse.User.currentProp('disable_jump_reply', true);
        // above is to prevent the ff in composer controller:
        // if ((!composer.get('replyingToTopic')) || (!Discourse.User.currentProp('disable_jump_reply'))) {
        //   Discourse.URL.routeTo(opts.post.get('url'));
        // }
        // could also fiddle with the post url to ensure I get redirected to chatty_maps_topic...
        // composer.set('replyingToTopic', true);

        // for now though, will do my own routing...
        var chattyMapUrl = "/maps/" + result.topic_slug + "/c";
        Discourse.URL.routeTo(chattyMapUrl);

        return resolve({
          post: result
        });
      }, function(error) {
        // If an error occurs
        if (postStream) {
          postStream.undoPost(createdPost);
        }
        composer.set('composeState', OPEN);

        // TODO extract error handling code
        var parsedError;
        try {
          var parsedJSON = $.parseJSON(error.responseText);
          if (parsedJSON.errors) {
            parsedError = parsedJSON.errors[0];
          } else if (parsedJSON.failed) {
            parsedError = parsedJSON.message;
          }
        } catch (ex) {
          parsedError = "Unknown error saving post, try again. Error: " + error.status + " " + error.statusText;
        }
        reject(parsedError);
      });
    });
  }

});
