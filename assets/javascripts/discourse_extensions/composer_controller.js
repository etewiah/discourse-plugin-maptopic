// Discourse.Composer.reopen({
require("discourse/controllers/composer")["default"].reopen({

  open: function(opts) {
    opts = opts || {};
    // var locationObject = opts.post.location;
    var dfr = this._super(opts);
    if(opts.draftKey === "reply_as_new_topic"){
      // TODO - get location from original post
    }
    if (opts.post && opts.post.location) {
      this.set('model.locationObject', opts.post.location);
      // might it be safer to find location like so:
      // this.get('topic.postStream.posts').findBy('id', opts.post.id).location
      // dfr.then(function(post_result) {
      //   // debugger;
      // });
    };
    dfr.then(function(result){
      debugger;
    })
    return dfr;
  },
  // locationChanged: function() {
  //   debugger;
  //   if (this.get('model.locationObject')) {
  //     return " change location";
  //   } else {
  //     return " select a location";
  //   };
  // }.property('model.locationObject'),
  setLocationPrompt: function() {
    // below only works if composer initiated by MapTopic which sets location object
    // for replies, I'll have to find currentPost: this.get('topic.currentPost')
    // and somehow figure out which location is associated with it
    // - will be easier when topic.geo has locations populated with post_ids

    //for longer term, pop up will have a list of existing locations to select rather than a map..

    if (this.get('model.locationObject')) {
      return " change location";
    } else {
      return " select a location";
    };
  }.property('model.locationObject'),
  locationTitle: function() {
    if (this.get('model.locationObject')) {
      return "associated location is: ' " + this.get('model.locationObject.title') + " '";
    } else {
      return "not associated with a location.";
    };
  }.property('model.locationObject.title'),
  actions: {
    showLocationSelector: function() {
      if (!this.get('model.topic.location') && !this.get('model.location')) {
// when creating a new topic from an existing post, need to do this to allow place selector to have a default city
        this.set('model.geo',this.get('topic.geo'));
      };
      // below calls method defined in application_route
      this.send('showLocationSelectorModal', this.get('model'));

    }
  }
});
