module MapTopic
  class TopicGeo < ActiveRecord::Base
    self.table_name = "topic_geos"
    # validates_uniqueness_of :bounds_value
    after_validation :reverse_geocode, :unless => :has_geo_data?

    def has_geo_data?
      self.city_lower? && self.country_lower?
    end

    serialize :poll, JSON
    serialize :places, JSON
    serialize :happening, JSON
    serialize :geometry, JSON


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

    # up to caller here to set topic_id on returned object
    def self.create_from_geo_key geo_key, capability
      topic_geo = MapTopic::TopicGeo.create(
        {
          bounds_value: geo_key.bounds_value,
          bounds_type: geo_key.bounds_type,
          bounds_range: geo_key.bounds_range,
          latitude: geo_key.latitude,
          longitude: geo_key.longitude,
          city_lower: geo_key.city_lower,
          country_lower: geo_key.country_lower,
          display_name: geo_key.display_name,
          capability: capability,
          geometry: geo_key.geometry
      })

      # TODO - figure out decent logic for this:
      topic_geo.hot_till = Date.today + 6.months
      topic_geo.hot_from = Date.today
      return topic_geo
    end

    # as well as in corrections job, also called from MapTopic::LocationTopic.create_from_location
    def add_or_update_place location, post_id
      # the idea of having the place col is that it saves me having to query deeply for the basic info that I
      # will need to display a nice infowindow when showing index of topics...

      # below is a workaround check while I still have some places in db
      # that are arrays
      # binding.pry
      unless (self.places.class == Hash) && (self.places['sorted_ids'])
        # should really make this the def value at db level
        self.places = {
          'sorted_ids' => []
        }
        self.save!
      end

      location_id = location.id.to_s
      unless self.places['sorted_ids'].include? location_id
        self.places['sorted_ids'].push location_id
      end

      if self.places[location.id]
        post_ids = self.places[location.id]['post_ids'] || []
      else
        post_ids = []
      end
      if post_id
        post_ids.push post_id.to_s
      end

      place = {}
      # place = topic_places.select{ |p| p['location_id'] == location_id }[0]
      # unless place
      #   place = {}
      #   topic_places.push place
      # end
      place['title'] = location.title
      place['address'] = location.address
      place['gplace_id'] = location.gplace_id
      place['longitude'] = location.longitude
      place['latitude'] = location.latitude
      place['location_id'] = location_id
      place['detailsConfirmed'] = false
      place['post_ids'] = post_ids

      # ensuring that there is always a happenings node on a place makes client side bindings work better..
      place['happenings'] = []

      # self.places[location.id.to_i] = place
      # the key always gets converted to a string on saving, even if I use to_i as above
      self.places[location.id] = place

      # in future, might store more in LocationTopic like happenings etc...
      # might get rid of LocationPosts...

      self.save!
    end

    def associate_place_with_post location_id, post_id
      if self.places[location_id]
        post_ids = self.places[location_id]['post_ids'] || []
        post_ids.push post_id.to_s
        self.places[location_id]['post_ids'] = post_ids.uniq
        self.save!
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
