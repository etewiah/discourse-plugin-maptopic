module MapTopic
  class Location < ActiveRecord::Base
    self.table_name = "locations"

    # geocoded_by :full_address
    after_validation :reverse_geocode

    after_create :create_slug

    # http://stackoverflow.com/questions/13433865/geocoding-addresses-with-geocoder-gem-and-postgis-database-with-rgeo
    reverse_geocoded_by :latitude, :longitude do |obj, results|
      # get here when I run
      # rake geocode:all CLASS=MapTopic::Location SLEEP=2.25 BATCH=5
      if geo = results.first
        # obj.latlon = Location.rgeo_factory_for_column(:latlon).point(geo.longitude, geo.latitude)
        returned_city = geo.city || geo.state
        # doing above because I found with St Helier for eg, it had it as state instead of city
        # prefering returned results to previously set ones
        obj.city = returned_city ?  returned_city.downcase : obj.city
        obj.address = geo.formatted_address ? geo.formatted_address : obj.address
        # geo.street_address
        obj.country = geo.country ? geo.country.downcase : obj.country
        obj.postal_code = geo.postal_code ? geo.postal_code : obj.postal_code
        obj.region = geo.state ? geo.state : obj.region
        # binding.pry
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

    def create_slug
      if self.title
        self.slug = [self.id, self.title.parameterize].join("-")
      end
      self.save
    end

    def self.create_from_location_hash location_hash
      longitude = location_hash[:longitude]
      latitude = location_hash[:latitude]
            # TODO - find location which is close enough to be considered the same..
      location = MapTopic::Location.where(:longitude => longitude, :latitude => latitude).first_or_initialize
      location.title = location_hash[:title] || ""
      location.city = location_hash[:city] || ""
      location.country = location_hash[:country] || ""
      location.address = location_hash[:address] || ""
      location.gplace_id = location_hash[:gplace_id] || ""
      location.save!
      return location
    end
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
