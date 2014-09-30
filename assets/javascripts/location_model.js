Discourse.Location = Discourse.Model.extend({

});
Discourse.Location.reopenClass({
  // TODO **  make use of result.place_id  (google place id...)
  locationFromPlaceSearch: function(result, city) {
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
    return locationObject;
  },
  locationFromGmap: function(result, city, country) {
    // TODO - check if I already have city and country as result from Gmap
    // can be dodgy (eg Balsall Heath for birmingham)
    var locationObject = {
        formattedAddress: result.formatted_address,
        latitude: result.geometry.location.lat(),
        longitude: result.geometry.location.lng()
      };
      // title will be provided through user input
      // if (!Ember.isBlank(city)) {
      //   locationObject.city = city;
      // }
      // latlng = result.geometry.location
    $.each(result.address_components, function(i, address_component) {
      if (address_component.types[0] == "locality") {
        locationObject.city = address_component.long_name.toLowerCase();
      }
      if (address_component.types[0] == "country") {
        locationObject.country = address_component.long_name.toLowerCase();
      }
      //return false; // break the loop   
    });

    return locationObject;
  }
});
