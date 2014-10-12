Discourse.DiscoveryRoute.reopen({
  beforeModel: function(transition) {
    // to ensure that when discovery route is handling '/'
    //  it redirects to map.root
    if (location.pathname === "/") {
      // if (transition.targetName.indexOf('discovery.latest') !== -1) {
      if (Discourse.Mobile.mobileView) {
        this.transitionTo('discovery.latest');
      } else {
        this.transitionTo('map.root');

      };
    }
  }
});
