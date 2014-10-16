// Discourse.MapMixin = Em.Mixin.create({

// });

Discourse.MapRootRoute = Discourse.Route.extend({

  beforeModel: function(transition) {
    var controller = this.controllerFor('map');
    // defaultCity now gets calculated server side
    // var currentCity = controller.currentCity || Discourse.SiteSettings.maptopic.defaultCityName;
    // var params = {};
    //     // only set currentCity if user is arriving at root route after 
    // if(controller.currentCity){
    //   params.currentCity = controller.currentCity;
    // }

            // where user is arriving for the 1st time, will be calculated server side:
// unless there is a preferred_city set for this user
// else if (Discourse.currentuser....) {};
    // var topicsModel = Discourse.TopicList.findWhereLocationPresent("", params);
    var topiclist = Discourse.GeoTopic.geoTopicsForCity(controller.currentCity);
    this.transitionTo('map.fromOneParam', topiclist);
  }

});

Discourse.MapFromOneParamRoute = Discourse.Route.extend( {

  model: function(params) {
    return Discourse.GeoTopic.geoTopicsForCity(params.currentCity);
    // var url = Discourse.getURL("/geo_topics/get_for_city");
    // return Discourse.ajax(url, {
    //   data: {
    //     city: params.currentCity
    //   }
    // });
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
    controller.set('content',model);
    var mapController = this.controllerFor('map');
    // mapController.set('content', model);
    // set above just to satisfy objectcontroller need for content....

    // city may have been calculated server side so lets save that to avoid making calculation again
    // TODO - save in localStorage?
    var  currentCity = model.city;
    // mapController.get('currentCity') || this.paramsFor(this.routeName).currentCity;
    mapController.set('currentCity', currentCity);
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
