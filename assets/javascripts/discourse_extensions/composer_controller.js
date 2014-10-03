// Discourse.Composer.reopen({
require("discourse/controllers/composer")["default"].reopen({

  open: function(opts) {
    opts = opts || {};
    // var locationObject = opts.post.location;
    var dfr = this._super(opts);
    if (opts.post && opts.post.location) {
      debugger;
      this.set('model.locationObject', opts.post.location);
      // might it be safer to find location like so:
      // this.get('topic.postStream.posts').findBy('id', opts.post.id).location
      // dfr.then(function(post_result) {
      //   // debugger;
      // });
    };
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
      // below calls method defined in application_route
      this.send('showLocationSelectorModal', this.get('model'));

    }
  }
});
