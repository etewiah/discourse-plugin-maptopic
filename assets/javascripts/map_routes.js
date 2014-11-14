// Discourse.MapMixin = Em.Mixin.create({

// });

Discourse.MapRootRoute = Discourse.Route.extend({

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
    this.transitionTo('map.fromOneParam', topiclist);
  }

});

Discourse.MapFromOneParamRoute = Discourse.Route.extend({

  model: function(params) {
    return Discourse.GeoTopic.geoTopicsForCity(params.geo);
  },
  // serialize: function(model) {
  //   return { val: 'recent' };
  // },
  setupController: function(controller, model) {
    controller.set('content', model);
    var mapController = this.controllerFor('map');
    // mapController.set('content', model);
    // set above just to satisfy objectcontroller need for content....

    // city may have been calculated server side so lets save that to avoid making calculation again
    // TODO - save in localStorage?
    // var currentCity = model.geo_key.bounds_value;

    var currentGeoKey = model.geo_key;
    
    // TODO - have displayString and value cols on geo_key correct to start with:
    currentGeoKey.displayString = currentGeoKey.display_name.capitalize();
    currentGeoKey.value = currentGeoKey.bounds_value.toLowerCase();

    mapController.set('currentGeoKey', currentGeoKey);

// TODO - investigate using above instead of below:
    // var       currentCitySelection = {
    //     displayString: model.geo_key.display_name.capitalize(),
    //     value: model.geo_key.bounds_value.toLowerCase(),
    //     longitude: model.geo_key.longitude,
    //     latitude: model.geo_key.latitude
    //   };
    // mapController.set('currentCitySelection', currentCitySelection);

    // mapController.get('currentCity') || this.paramsFor(this.routeName).currentCity;
    // mapController.set('currentCity', currentCity);
    Discourse.set('title', model.geo_key.display_name + ' - recent conversations');
  }

});


Discourse.Route.buildRoutes(function() {
  this.resource('map', {
    path: '/map'
  }, function() {
    this.route('root', {
      path: '/'
    });
    this.route('fromOneParam', {
      path: '/:geo'
    });
  });
});

