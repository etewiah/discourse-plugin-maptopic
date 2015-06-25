// Discourse.ManageUserGeoKeysView = Discourse.View.extend({
Discourse.ManageUserGeoKeysController = Discourse.ObjectController.extend({
  actions: {
    removeUserGeoKey: function(geoKey){
      Discourse.GeoTopic.removeFromLlsGeoIndexList(geoKey);
    },
    clearLsGeoKeys: function(){
      debugger;
      Discourse.KeyValueStore.remove('lsGeoIndexList');
    }
  },
  citySelectionItemsWithUrls: function() {
    var router = this.get('target');
    var selectionItems = Discourse.GeoTopic.getGeoIndexList(router);

    Discourse.KeyValueStore.set({
      key: 'lsGeoIndexList',
      value: JSON.stringify(selectionItems)
    });
    // debugger;
    return selectionItems;
  }.property(),
  serverGeoKeys: function() {
    var url = Discourse.getURL("/geo_topics/get_geo_keys");
    var result = Discourse.ajax(url, {
    });
    // debugger;
    return [];
  }.property(),
})