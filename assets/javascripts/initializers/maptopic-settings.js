// pretty awesome - just placing this here causes it to be picked up
// didn't even have to add it to plugin.rb file...
export
default {
    name: "maptopic-settings",

    initialize: function() {
        Discourse.SiteSettings.maptopic = {
            defaultCity: {
                city_name: "madrid",
                longitude: "-3.7037902",
                latitude: "40.4167754",
                country: "Spain",
            }

        };
    }
};
