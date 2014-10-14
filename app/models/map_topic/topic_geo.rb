module MapTopic
    class TopicGeo < ActiveRecord::Base
        self.table_name = "topic_geos"
        # validates_uniqueness_of :bounds_value
        after_validation :reverse_geocode
        serialize :poll, JSON
        serialize :places, JSON
        serialize :happening, JSON

        belongs_to :topic

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
        # t.integer :topic_id
        # t.float :longitude
        # t.float :latitude
        # t.string :bounds_type
        # t.string :bounds_value
        # t.integer :bounds_range
        # t.string :country_lower
        # t.string :country_code
        # t.string :city_lower
        # t.text :places
        # t.text :happening
        # t.text :poll
        # t.datetime :hot_from
        # t.datetime :hot_till
        # t.string :capability

    end
end
