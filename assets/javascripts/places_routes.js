Discourse.PlaceRootRoute = Discourse.Route.extend({

});

Discourse.PlaceRoute = Discourse.Route.extend({

  model: function(params) {
    return Discourse.Location.getDetails(params.slug);
  },
  // serialize: function(model) {
  //   return { val: 'recent' };
  // },
  setupController: function(controller, model) {
    controller.set('content', model);
  }


});


Discourse.PlacesRootRoute = Discourse.Route.extend({


// TODO - investigate why this sometimes gets called twice resulting in 2 calls to geoTopicsForCity
  beforeModel: function(transition) {
    // where user is arriving for the 1st time, will be calculated server side:
    // unless there is a preferred_city set for this user
    var controller = this.controllerFor('map');
    if (controller.get('currentGeoKey.value')) {
      var currentGeoKeyValue = controller.get('currentGeoKey.value');
    }
    else{
      // below checks localstorage just in case user has visited site previously
      var currentGeoKeyValue = Discourse.GeoTopic.getUserDefaultGeoKeyValue();
    } 
    debugger;

    var topiclist = Discourse.GeoTopic.geoTopicsForCity(currentGeoKeyValue);

    this.transitionTo('places.fromGeo', topiclist);
  }

});

Discourse.PlacesFromGeoRoute = Discourse.Route.extend({

  model: function(params) {
    return Discourse.Location.geoLocationsForGeo(params.geo);
  },
  // serialize: function(model) {
  //   return { val: 'recent' };
  // },
  setupController: function(controller, model) {
    // debugger;
    controller.set('content', model);
  }

});


Discourse.Route.buildRoutes(function() {
  this.resource('place', {
    path: '/pl/:slug'
  }, function() {
    this.route('root', {
      path: '/'
    });
  });
  this.resource('places', {
    path: '/places'
  }, function() {
    this.route('root', {
      path: '/'
    });
    this.route('fromGeo', {
      path: '/:geo'
    });
  });
});

