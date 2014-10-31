Discourse.ManageUserGeoKeysRoute = Discourse.Route.extend({

  model: function(params) {
    var url = Discourse.getURL("/geo_topics/get_geo_keys");
    var result = Discourse.ajax(url, {});
    return result;
  },
  // serialize: function(model) {
  //   return { val: 'recent' };
  // },
  setupController: function(controller, model) {
    controller.set('content', model);
  }
});
Discourse.Route.buildRoutes(function() {
  this.resource('manage', {
    path: '/manage'
  }, function() {
    this.route('userGeoKeys', {
      path: '/user_geo_keys'
    });
  });
});
