// pretty awesome - just placing this here causes it to be picked up
// didn't even have to add it to plugin.rb file...
export
default {
  name: "maptopic-settings",

  initialize: function() {
    Discourse.SiteSettings.maptopic = {
      api_url_base: '/gapi',
      // 'http://gigsounder.com/gapi',
      // '/gapi',
      defaultCity: 'birmingham',
      defaultTimeRange: 'this_week',
      citySelectionItems: [{
        displayString: 'Berlin',
        value: 'berlin'
      }, {
        displayString: 'Birmingham',
        value: 'birmingham'
      }, {
        displayString: 'London',
        value: 'london'
      }, {
        displayString: 'Madrid',
        value: 'madrid'
      }],
      timerangeSelectionItems: [{
        displayString: 'this week',
        value: 'this_week'
      }, {
        displayString: 'next week',
        value: 'next_week'
      }]


    };
  }
};
