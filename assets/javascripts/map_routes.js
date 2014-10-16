// Discourse.MapMixin = Em.Mixin.create({

// });

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

Discourse.MapFromOneParamRoute = Discourse.Route.extend( {

  model: function(params) {
    var url = Discourse.getURL("/geo_topics/get_for_city");
    return Discourse.ajax(url, {
      data: {
        city: params.currentCity
      }
    });
    // .then(function(result) {
    //   console.log(params);
    //   debugger;
    //   return result;
    //   // return Discourse.TopicList.fromWhereLocationPresent(result, filter_url, params);
    // });

  },
  // serialize: function(model) {
  //   return { val: 'recent' };
  // },
  setupController: function(controller, model) {
    debugger;
    var mapController = this.controllerFor('map');
    // mapController.set('content', model);
    // set above just to satisfy objectcontroller need for content....
    var  currentCity = this.paramsFor(this.routeName).currentCity;
    mapController.set('currentCity', currentCity);
    controller.set('content',model);
    Discourse.set('title', currentCity.capitalize() + ' - recent conversations');
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
