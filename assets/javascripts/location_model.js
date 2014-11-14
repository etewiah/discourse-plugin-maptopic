// TODO - move into its own file
Discourse.GeoTopic = Discourse.Model.extend({

});
Discourse.GeoTopic.reopenClass({
  getUserDefaultGeoKeyValue: function() {
    var userDefaultGeoKey = Discourse.KeyValueStore.get('lsUserDefaultGeoKey');
    debugger;
    if (userDefaultGeoKey) {
      return JSON.parse(userDefaultGeoKey).value;
    } else {
      return null;
    };
  },
  setUserDefaultGeoKey: function(geoKey) {
    Discourse.KeyValueStore.set({
      key: 'lsGeoIndexList',
      value: JSON.stringify(geoKey)
    });
  },
  removeFromLlsGeoIndexList: function(geoKey) {
    var lsGeoIndexList = Discourse.KeyValueStore.get('lsGeoIndexList');
    if (lsGeoIndexList) {
      var selectionItems = JSON.parse(lsGeoIndexList);

      var newSelectionItems = selectionItems.rejectBy('value', geoKey.value);
      // debugger;
      Discourse.KeyValueStore.set({
        key: 'lsGeoIndexList',
        value: JSON.stringify(newSelectionItems)
      });
    }
  },
  getGeoIndexList: function(router) {
    // var lsGeoIndexListUpToDate = true;
    var lsGeoIndexList = Discourse.KeyValueStore.get('lsGeoIndexList');
    if (lsGeoIndexList) {
      // If has been saved in local storage, return that
      var selectionItems = JSON.parse(lsGeoIndexList);
    } else {
      // lsGeoIndexListUpToDate = false;
      // todo - get from server
      var selectionItems = Discourse.SiteSettings.maptopic.citySelectionItems;
      selectionItems.forEach(function(item) {
        item.url = router.generate('map.fromOneParam', {
          city: item.value
        });
      }, this);

    }
    return selectionItems;
  },
  // TODO **  make use of result.place_id  (google place id...)
  geoTopicsForCity: function(geo) {
    if (!geo) {
      console.log('no geo, will be expensive on server...');
    };
    var url = Discourse.getURL("/geo_topics/get_for_geo");
    return Discourse.ajax(url, {
      data: {
        geo: geo
      }
    });
  },
});


Discourse.Location = Discourse.Model.extend({

});
Discourse.Location.reopenClass({
  getDetails: function(slug) {
    var url = Discourse.getURL("/locations/get_details");
    return Discourse.ajax(url, {
      data: {
        id: slug
      }
    });

  },
  geoLocationsForGeo: function(geo) {
    if (!geo) {
      console.log('no geo, will be expensive on server...');
    };
    var url = Discourse.getURL("/locations/get_for_geo");
    return Discourse.ajax(url, {
      data: {
        geo: geo
      }
    });
  },
  geoPlaceFromGooglePlace: function(result) {
    // a textsearch result has formatted_address (which is preferred) instead of vicinity
    var address = result.formatted_address || result.vicinity;
    var phone_no = result.international_phone_number || "";
    var locationObject = {
      title: result.name,
      address: address,
      phone_no: phone_no,
      latitude: result.geometry.location.lat(),
      longitude: result.geometry.location.lng(),
      gplace_id: result.place_id,
      website: ""
    };
    var urls = [];
    if (result.url) {
      urls.push({
        title: 'Google Place site',
        url: result.url
      })
    };
    if (result.website) {
      urls.push({
        title: 'Website',
        url: result.website
      })
    };
    locationObject.urls = urls;
    var placePhotos = [];
    if (result.photos && result.photos.length > 0) {
      var photos = result.photos.slice(0, 5);
      photos.forEach(function(photo) {
        var photoUrl = photo.getUrl({
          'maxWidth': 150,
          'maxHeight': 150
        })
        placePhotos.push({
          url: photoUrl,
          preferred: false
        });
      })
    }
    locationObject.photos = placePhotos;
    //TODO -  city and country...
    return locationObject;
  },
  locationFromPlaceSearch: function(result, city) {
    // debugger;
    var locationObject = {
      title: result.name,
      address: result.vicinity,
      latitude: result.geometry.location.lat(),
      longitude: result.geometry.location.lng(),
      gplace_id: result.place_id
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
      address: result.formatted_address,
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
