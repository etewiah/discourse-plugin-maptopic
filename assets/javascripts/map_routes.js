Discourse.MapMixin = Em.Mixin.create({
    
  // activate: function(transition) {
  //   this._super()
  //   // ensure conversations nav is not shown in app handlebars
  //   var appController = this.controllerFor('application');
  //   // console.log('conv route setting activeSubnav to conversations');
  //   appController.set('showSubnav', true);
  //   appController.set('activeSubnav', 'conversations');
  // },
  // deactivate: function(transition) {
  //   this._super()
  //   // ensure conversations nav is shown in app handlebars
  //   var appController = this.controllerFor('application');
  //   // console.log('conv route setting activeSubnav to gigs');
  //   appController.set('showSubnav', false);
  //   // appController.set('activeSubnav', 'gigs');
  // }
});

Discourse.MapRootRoute = Discourse.Route.extend({

  beforeModel: function(transition) {
    var controller = this.controllerFor('map');
    // defaultCity now gets calculated server side
    // var currentCity = controller.currentCity || Discourse.SiteSettings.maptopic.defaultCityName;
    var params = {};
        // only set currentCity if user is arriving at root route after 
    if(controller.currentCity){
      params.currentCity = controller.currentCity;
    }
            // where user is arriving for the 1st time, will be calculated server side:
// unless there is a preferred_city set for this user
// else if (Discourse.currentuser....) {};
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
    // debugger;
    mapController.set('content', model);
    // set above just to satisfy objectcontroller need for content....
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
