module MapTopic
    class GeoKey < ActiveRecord::Base
        self.table_name = "geo_keys"
        validates_uniqueness_of :bounds_value
        after_validation :reverse_geocode
        # reverse_geocoded_by :latitude, :longitude

        # http://stackoverflow.com/questions/13433865/geocoding-addresses-with-geocoder-gem-and-postgis-database-with-rgeo
        reverse_geocoded_by :latitude, :longitude do |obj, results|
            # get here when I run
            # rake geocode:all CLASS=MapTopic::GeoKey SLEEP=2.25 BATCH=5
# all this just to add country, but worthwhile...
            if geo = results.first
                obj.city_lower = geo.city ?  geo.city.downcase : obj.city_lower
                # obj.address = geo.formatted_address ? geo.formatted_address : obj.address
                # geo.street_address
                obj.country_lower = geo.country ? geo.country.downcase : obj.country_lower
                # obj.postal_code = geo.postal_code ? geo.postal_code : obj.postal_code
                # obj.region = geo.state ? geo.state : obj.region
            end
        end

        # t.string :display_name
        # t.float :longitude
        # t.float :latitude
        # t.string :bounds_type
        # t.string :bounds_value
        # t.integer :bounds_range
        # t.string :country_lower
        # t.string :city_lower
        # t.string :show_criteria

    end
end
