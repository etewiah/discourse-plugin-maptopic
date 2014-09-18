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
    var currentCity = Discourse.SiteSettings.maptopic.defaultCityName;
    var params = {
      currentCity: currentCity
    }
    // TODO - figure out default city bases 
    // var defaultCity = "madrid";
    var convModel = Discourse.TopicList.findWhereLocationPresent("", params);
    this.transitionTo('map.fromOneParam', convModel);
  }

});

Discourse.MapFromOneParamRoute = Discourse.Route.extend(Discourse.MapMixin, {

  model: function(params) {
    // TODO make use of params to return either venue conversations or gig conversations
    return Discourse.TopicList.findWhereLocationPresent("", params);
    // return Discourse.TopicList.findWhereLocationPresent("h/visitor_topics/" + params.tag, {});
  },
  // serialize: function(model) {
  //   return { val: 'recent' };
  // },
  setupController: function(controller, model) {
    var mapController = this.controllerFor('map');
    mapController.set('currentCity', model.params.currentCity);
    controller.set('content',model);
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
      path: '/:currentCity'
    });

  });

});
