// reopening to allow processing of topiclist which includes location_topic
Discourse.TopicList.reopenClass({
  topicsFromWhereLocationPresent: function(result) {
    // Stitch together our side loaded data
    var categories = Discourse.Category.list(),
      users = this.extractByKey(result.users, Discourse.User),
      locations = result.topic_list.locations,
      location_topics = result.topic_list.location_topics;
    return result.topic_list.topics.map(function(t) {
      var location_topic = location_topics.findBy('topic_id', t.id);
      // t.gig_id = location_topic.gig_id;
      if (location_topic) {
        t.location = locations.findBy('id', location_topic.location_id);
        // t.excerpt = location_topic.location_title;
        // t.location_title = location_topic.location_title;
        // t.latitude = location_topic.latitude;
        // t.longitude = location_topic.longitude;
      }
      t.category = categories.findBy('id', t.category_id);
      t.posters.forEach(function(p) {
        p.user = users[p.user_id];
      });
      if (t.participants) {
        t.participants.forEach(function(p) {
          p.user = users[p.user_id];
        });
      }
      var topic = Discourse.Topic.create(t);
      return topic;
    });
  },

  fromWhereLocationPresent: function(result, filter_url, params) {
    // debugger;
    // todo - find out what params is used for in original implementation 
    var topicList = Discourse.TopicList.create({
      inserted: Em.A(),
      filter: filter_url,
      params: params || {},
      topics: Discourse.TopicList.topicsFromWhereLocationPresent(result),
      can_create_topic: result.topic_list.can_create_topic,
      more_topics_url: result.topic_list.more_topics_url,
      draft_key: result.topic_list.draft_key,
      draft_sequence: result.topic_list.draft_sequence,
      draft: result.topic_list.draft,
      loaded: true,
      currentCity: params.currentCity
    });

    if (result.topic_list.filtered_category) {
      topicList.set('category', Discourse.Category.create(result.topic_list.filtered_category));
    }
    return topicList;
  },

  findWhereLocationPresent: function(filter_url, params) {
    var url = Discourse.getURL("/location_topics/get_for_city") ;
    var cityObject = Discourse.SiteSettings.maptopic.citySelectionItems.findBy('value',params.currentCity);
    var latitude = cityObject.latitude || 0;
    var longitude = cityObject.longitude || 0;
    return Discourse.ajax(url, {
      data: {
        longitude: longitude,
        latitude: latitude
      }
    }).then(function(result) {
      return Discourse.TopicList.fromWhereLocationPresent(result, filter_url, params);
    });
    // original method below would sometimes retrieve topic_list
    // from PreloadStore which obviously would not have my gig_list
    // return PreloadStore.getAndRemove("topic_list", finderFor(filter_url, params)).then(function(result) {
    //   return Discourse.TopicList.fromWhereLocationPresent(result, filter_url, params);
    // });
  }

});
