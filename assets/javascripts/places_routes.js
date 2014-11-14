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

  beforeModel: function(transition) {
    var controller = this.controllerFor('map');

    var topiclist = Discourse.GeoTopic.geoTopicsForCity(controller.currentCity);
    debugger;
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

