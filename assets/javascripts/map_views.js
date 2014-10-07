Discourse.MapView = Discourse.View.extend({
  templateName: 'map_landing',
  // contentBinding: 'controller.content',
});
Discourse.MapFromOneParamView = Discourse.View.extend({
  templateName: function() {
    if (Discourse.SiteSettings.maptopic.showLocationsPreview) {
      if (Discourse.Mobile.mobileView) {
        return 'map_with_sidebox_mobile';
      } else {
        return 'map_with_sidebox_desktop';
      }
    }
    else{
      return 'map_full_page';
    }
  }.property(),
  didInsertElement: function() {}
});
