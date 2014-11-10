// Discourse.PlacesView = Discourse.View.extend({
//   templateName: "places/places_landing",
//   // contentBinding: 'controller.content',
// });

Discourse.PlacesFromGeoView = Discourse.View.extend({
  templateName: "places/places_landing",
  // function() {
  //   if (Discourse.SiteSettings.maptopic.showLocationsPreview) {
  //     return 'map_with_sidebox_desktop';
  //     // if (Discourse.Mobile.mobileView) {
  //     //   return 'map_with_sidebox_mobile';
  //     // } else {
  //     //   return 'map_with_sidebox_desktop';
  //     // }
  //   } else {
  //     return 'map_full_page';
  //   }
  // }.property(),
  didInsertElement: function() {}
});
