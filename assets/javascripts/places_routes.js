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
//     var mapController = this.controllerFor('map');
//     // mapController.set('content', model);
//     // set above just to satisfy objectcontroller need for content....

//     // city may have been calculated server side so lets save that to avoid making calculation again
//     // TODO - save in localStorage?
//     var currentCity = model.geo_key.bounds_value;

//     var currentGeoKey = model.geo_key;
//     mapController.set('currentGeoKey', currentGeoKey);

// // TODO - investigate using above instead of below:
//     var       currentCitySelection = {
//         displayString: model.geo_key.display_name.capitalize(),
//         value: model.geo_key.bounds_value.toLowerCase(),
//         longitude: model.geo_key.longitude,
//         latitude: model.geo_key.latitude
//       };
//     mapController.set('currentCitySelection', currentCitySelection);


// // TODO - remove this:
//     var selectionItems = Discourse.SiteSettings.maptopic.citySelectionItems;



//     // mapController.get('currentCity') || this.paramsFor(this.routeName).currentCity;
//     mapController.set('currentCity', currentCity);
    // Discourse.set('title', model.geo_key.display_name + ' - recent conversations');
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

