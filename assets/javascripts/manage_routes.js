
Discourse.Route.buildRoutes(function() {
  this.resource('manage', {
    path: '/manage'
  }, function() {
    this.route('userGeoKeys', {
      path: '/user_geo_keys'
    });
    this.route('fromOneParam', {
      path: '/:geo'
    });
  });
});