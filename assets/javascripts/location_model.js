Discourse.Location = Discourse.Model.extend({

});
Discourse.Location.reopenClass({
  locationFromGmapResult: function(result, city) {
    var locationObject = {
      title: result.name,
      formattedAddress: result.vicinity,
      latitude: result.geometry.location.lat(),
      longitude: result.geometry.location.lng()
    }
    if (!Ember.isBlank(city)) {
      locationObject.city = city;
    }
    // latlng = result.geometry.location
    debugger;

    return locationObject;
  }
});
