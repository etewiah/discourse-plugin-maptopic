Discourse.Location = Discourse.Model.extend({

});
Discourse.Location.reopenClass({
  locationFromGmapResult: function(result) {
    // debugger;
    var locationObject = {
        title: result.name,
        formattedAddress: result.vicinity,
        latitude: result.geometry.location.lat(),
        longitude: result.geometry.location.lng()
      }
      // latlng = result.geometry.location
    return locationObject;
  }
});
