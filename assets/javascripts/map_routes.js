Discourse.MapMixin = Em.Mixin.create({
  activate: function(transition) {
    this._super()
    // ensure conversations nav is not shown in app handlebars
    var appController = this.controllerFor('application');
    // console.log('conv route setting activeSubnav to conversations');
    appController.set('showSubnav', true);
    appController.set('activeSubnav', 'conversations');
  },
  deactivate: function(transition) {
    this._super()
    // ensure conversations nav is shown in app handlebars
    var appController = this.controllerFor('application');
    // console.log('conv route setting activeSubnav to gigs');
    appController.set('showSubnav', false);
    // appController.set('activeSubnav', 'gigs');
  }
});

Discourse.MapRootRoute = Discourse.Route.extend({
  activate: function(transition) {
    this._super()
    // ensure conversations nav is not shown in app handlebars
    var appController = this.controllerFor('application');
    // console.log('conv route setting activeSubnav to conversations');
    appController.set('showSubnav', true);
    appController.set('activeSubnav', 'conversations');
  },
  deactivate: function(transition) {
    this._super()
    // ensure conversations nav is shown in app handlebars
    var appController = this.controllerFor('application');
    // console.log('conv route setting activeSubnav to gigs');
    appController.set('showSubnav', false);
    // appController.set('activeSubnav', 'gigs');
  },
  beforeModel: function(transition) {
    var convModel = Discourse.TopicList.findWhereGigList("h/gig_topics", {});
    this.transitionTo('map.fromOneParam', convModel);
  }

});

Discourse.MapFromOneParamRoute = Discourse.Route.extend(Discourse.MapMixin, {

  model: function(params) {
    // TODO make use of params to return either venue conversations or gig conversations
    return Discourse.TopicList.findWhereGigList("h/gig_topics/" + params.tag, {});
    // return Discourse.TopicList.findWhereGigList("h/visitor_topics/" + params.tag, {});
  },
  serialize: function(model) {
    return { val: 'recent' };
  },
  setupController: function(controller, model) {
    this.controllerFor('discovery/topics').setProperties({
      "model": model
      //  "tagname": this.get("tag")
    });
  },
  renderTemplate: function() {
    var controller = this.controllerFor('discovery/topics');
    // this.render('tag_topic_list_head', { controller: controller, outlet: 'navigation-bar' });
    // this.render('discovery/topics', { controller: controller, outlet: 'list-container'});
// about the only change I make to either of these 2 templates is to remove the footer
    var topicsTemplate = "conversations/gig_topics";
    if(Discourse.Mobile.mobileView){
      topicsTemplate = "conversations/gig_topics_mobile";
    }
    this.render(topicsTemplate, {
      controller: controller,
      outlet: 'list-container'
    });
  }
});


Discourse.Route.buildRoutes(function() {

  this.resource('map', {
    path: '/map'
  }, function() {
    this.route('root', {
      path: '/'
    });
    // :val can be gigs, artists (performers??) or venues
    this.route('fromOneParam', {
      path: '/:val'
    });

  });

});
