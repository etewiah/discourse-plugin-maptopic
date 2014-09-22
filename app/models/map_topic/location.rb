module MapTopic
    class Location < ActiveRecord::Base
        self.table_name = "locations"

        # geocoded_by :full_address
        after_validation :reverse_geocode

        # http://stackoverflow.com/questions/13433865/geocoding-addresses-with-geocoder-gem-and-postgis-database-with-rgeo
        reverse_geocoded_by :latitude, :longitude do |obj, results|
            # get here when I run
            # rake geocode:all CLASS=MapTopic::Location SLEEP=2.25 BATCH=5
            if geo = results.first
                # obj.latlon = Location.rgeo_factory_for_column(:latlon).point(geo.longitude, geo.latitude)
                obj.city = geo.city
                obj.address = geo.formatted_address
                # geo.street_address
                obj.country = geo.country
                obj.postal_code = geo.postal_code
                obj.region = geo.state            
            end
        end

        # the full_address method
        # only useful as input to geocoder to find coordinates which I don't need
        # def full_address
        #     # "#{address}, #{postal_code}, #{city}, #{country}"
        #     nil
        # end

        # def full_address=(value)
        #     binding.pry
        #     self.city = value.city
        #     # lon = self.latlon.lon
        #     # self.latlon = Location.rgeo_factory_for_column(:latlon).point(lon, value)
        # end

        has_many :location_topics
        # , class_name: "::Blog::GigTopic"
        has_many :topics, through: :location_topics
        has_many :location_posts
        has_many :posts, through: :location_posts

        #     t.string :title
        # t.text :description
        # t.text :address
        # t.string :city
        # t.string :region
        # t.string :postal_code
        # t.string :country
        # t.float :longitude
        # t.float :latitude
        # t.integer :topics_count

    end
end
