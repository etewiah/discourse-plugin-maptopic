// Discourse.MapMixin = Em.Mixin.create({

// });

Discourse.MapRootRoute = Discourse.Route.extend({

  beforeModel: function(transition) {
    var controller = this.controllerFor('map');
    // defaultCity now gets calculated server side

    // where user is arriving for the 1st time, will be calculated server side:
    // unless there is a preferred_city set for this user
    // else if (Discourse.currentuser....) {};
    // var topicsModel = Discourse.TopicList.findWhereLocationPresent("", params);
    var topiclist = Discourse.GeoTopic.geoTopicsForCity(controller.currentCity);
    this.transitionTo('map.fromOneParam', topiclist);
  }

});

Discourse.MapFromOneParamRoute = Discourse.Route.extend({

  model: function(params) {
    debugger;
    return Discourse.GeoTopic.geoTopicsForCity(params.geo);
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
    controller.set('content', model);
    var mapController = this.controllerFor('map');
    // mapController.set('content', model);
    // set above just to satisfy objectcontroller need for content....

    // city may have been calculated server side so lets save that to avoid making calculation again
    // TODO - save in localStorage?
    var currentCity = model.geo;

    var currentGeoKey = model.geo_key;
    mapController.set('currentGeoKey', currentGeoKey);

// TODO - investigate using above instead of below:
    var       currentCitySelection = {
        displayString: model.geo_key.display_name.capitalize(),
        value: model.geo_key.bounds_value.toLowerCase(),
        longitude: model.geo_key.longitude,
        latitude: model.geo_key.latitude
      };
    mapController.set('currentCitySelection', currentCitySelection);


// TODO - remove this:
    var selectionItems = Discourse.SiteSettings.maptopic.citySelectionItems;



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
// TODO - rename city below to :geo
    this.route('fromOneParam', {
      path: '/:geo'
    });

  });

});
