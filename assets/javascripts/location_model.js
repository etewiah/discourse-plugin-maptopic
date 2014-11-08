// TODO - move into its own file
Discourse.GeoTopic = Discourse.Model.extend({

});
Discourse.GeoTopic.reopenClass({
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
  geoPlaceFromGooglePlace: function(result) {
    // debugger;
    var locationObject = {
      title: result.name,
      address: result.vicinity,
      latitude: result.geometry.location.lat(),
      longitude: result.geometry.location.lng(),
      gplace_id: result.place_id
    };
    var placePhotos = [];
    var photos = result.photos;
    if (photos && photos.length > 0) {
      var photoUrl = photos[0].getUrl({
        'maxWidth': 150,
        'maxHeight': 150
      })
      placePhotos.push({
        "url": photoUrl
      });
    }
    locationObject.photos = placePhotos;
    debugger;
    // for geoplaces, I don't care about city or country...
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
