// pretty awesome - just placing this here causes it to be picked up
// didn't even have to add it to plugin.rb file (cos its a .es6 file)...
export
default {
  name: "maptopic-settings",

  initialize: function() {
    Discourse.SiteSettings.maptopic = {
      // defaultCity: {
      //   city_name: "madrid",
      //   longitude: "-3.7037902",
      //   latitude: "40.4167754",
      //   country: "Spain",
      // },
      defaultCityName: 'madrid',
      citySelectionItems: [{
        displayString: 'Berlin',
        value: 'berlin',
        longitude: "13.4060912", 
        latitude: "52.519171"
      }, {
        displayString: 'Birmingham',
        value: 'birmingham',
        longitude: "-1.890401", 
        latitude: "52.48624299999999"
      }, {
        displayString: 'London',
        value: 'london',
        longitude: "-0.1198244", 
        latitude: "51.51121389999999"
      }, {
        displayString: 'Madrid',
        longitude: "-3.7037902",
        latitude: "40.4167754",
        value: 'madrid'
      },{
        displayString: 'Porto',
        longitude: "-8.6239254",
        latitude: "41.1566892",
        value: 'porto'
      }]

    };
  }
};
