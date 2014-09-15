Discourse.DiscoveryRoute.reopen({
  beforeModel: function(transition) {
    // to ensure that when discovery route is handling '/'
    // which by default is 'latest', it redirects to map.root
    if (transition.targetName.indexOf('discovery.latest') !== -1) {
      this.transitionTo('map.root');
    }
    // above overrides what happens in the original 'discovery_route'
    // if (transition.targetName.indexOf("discovery.top") === -1 &&
    //     Discourse.User.currentProp("should_be_redirected_to_top")) {
    //   Discourse.User.currentProp("should_be_redirected_to_top", false);
    //   this.transitionTo("discovery.top");
    // }
  }
});