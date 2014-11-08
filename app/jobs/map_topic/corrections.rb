# run “MapTopic::Jobs.migrate_geo_key_values" from console
module MapTopic
  class Jobs
    # include Sidekiq::Worker

    require 'pry'


    # only need to run this once to correct missing geometry in existing geo_keys..
    # run on klavao 30 oct 2014
    def self.ensure_each_geo_key_has_geometry
      MapTopic::GeoKey.all.each do |geo_key|
        if geo_key.geometry
          next
        end
        results = Geocoder.search(geo_key.bounds_value)

        if geo = results.first
          if geo.city
            # bounds_value = geo.city.downcase
            display_name = geo.city.titleize
            bounds_type = "city"
            city_lower = geo.city.downcase
          else
            # if I don't add both city_lower and country_lower, geocoder will be called again
            # in after_validation callback

            city_lower = "unknown"
            if geo.types.include? 'country'
              # bounds_value = geo.country.downcase
              bounds_type = "country"
              display_name = geo.country.titleize
            else
              # bounds_value = geo.country
              display_name = "unknown"
              bounds_type = "unknown"
            end

          end

          geo_key.geometry = geo.geometry

          if geo_key.display_name != display_name || (geo_key.city_lower != city_lower)
            binding.pry
            geo_key.display_name = display_name
            geo_key.city_lower = city_lower

          end

          if geo_key.bounds_type != bounds_type
            binding.pry
            geo_key.bounds_type = bounds_type
          end

          geo_key.save!

        end

      end

      # MapTopic::LocationTopic.all.each{ |l| p l.location_title}
      MapTopic::LocationTopic.all.each do |location_topic|
        if location_topic.topic
          primary_post = location_topic.topic.posts.where(:post_number == 1).first
          unless primary_post.location
            location_post = MapTopic::LocationPost.where(:post_id => primary_post.id).first_or_initialize
            location_post.location_title = location_topic.location_title
            location_post.longitude = location_topic.longitude
            location_post.latitude = location_topic.latitude
            location_post.location_id = location_topic.location_id

            location_post.save!
          end
        end
      end
    end


    # below was in location_topic model and only needed to be run once
    # get_nearest_location_to_request to find out which of the valid locations is closest
    # to current user based on ip address
    # def self.create_index_locations()
    #     berlin = MapTopic::LocationTopic.where({location_title: 'berlin', longitude: "13.4060912",
    #                                             location_id: 0, topic_id: 0,  latitude: "52.519171"}).first_or_initialize
    #     berlin.save!
    #     birmingham = MapTopic::LocationTopic.where({location_title: 'birmingham', longitude: "-1.890401",
    #                                                 latitude: "52.48624299999999", location_id: 0, topic_id: 0}).first_or_initialize
    #     birmingham.save!
    #     london = MapTopic::LocationTopic.where({location_title: 'london', longitude: "-0.1198244",
    #                                             latitude: "51.51121389999999", location_id: 0, topic_id: 0}).first_or_initialize
    #     london.save!
    #     madrid = MapTopic::LocationTopic.where({location_title: 'madrid', longitude: "-3.7037902",
    #                                             latitude: "40.4167754", location_id: 0, topic_id: 0}).first_or_initialize
    #     madrid.save!
    #     porto = MapTopic::LocationTopic.where({location_title: 'porto', longitude: "-8.6239254",
    #                                          latitude: "41.1566892", location_id: 0, topic_id: 0}).first_or_initialize
    #     porto.save!
    # end

    # only need to run this once to migrate geo_keys which had previously been created as locationtopics..
    # ie - update the items created above
    def self.migrate_geo_key_values
      # MapTopic::LocationTopic.where(:location_title => city_name.downcase,:location_id => 0)
      MapTopic::LocationTopic.where(:location_id => 0).each do |location_topic|
        geo_key = MapTopic::GeoKey.where(:bounds_value => location_topic.location_title.downcase).first_or_initialize
        geo_key.latitude = location_topic.latitude
        geo_key.longitude = location_topic.longitude
        geo_key.city_lower = location_topic.location_title.downcase
        geo_key.display_name = location_topic.location_title.titleize
        geo_key.bounds_type = "city"
        geo_key.bounds_range = 20
        geo_key.save!
      end
    end

    def self.ensure_topic_geos_have_geometry
      # todo....
    end

    # code updated 8 nov 2014
    # this ensures that topics that were created recently and have a geo, also have places set
    # run below before ensure_topics_have_topic_geo_and_places
    def self.ensure_topic_geos_have_places
      MapTopic::TopicGeo.all.each do |topic_geo|
        topic_geo.hot_till = Date.today + 6.months
        topic_geo.hot_from = Date.today
        topic_geo.save!

        if topic_geo.topic && topic_geo.topic.locations
          topic_geo.topic.locations.each do |location|
            topic_geo.topic.geo.add_or_update_place location
          end
        else
          binding.pry
        end
        # if topic_geo.id == 27
        #   binding.pry
        # end
      end
    end

    # only need to run this once to ensure all geo_topics have geo and geo.places json set ..
    # code updated 8 nov 2014
    # Below only targets topics which don't have geo set which is why I
    # run below after ensure_topic_geos_have_places
    def self.ensure_topics_have_topic_geo_and_places
      # migrate_topic_geo_values

      # topic = Topic.find(12)
      Topic.all.each do |topic|
        unless topic.geo
          if topic.location

            topic_geo = create_geo_for_topic topic
            topic.locations.each do |location|
              binding.pry
              # topic.geo.add_or_update_place location
              # topic here might not have ref to geo even though its been set
              topic_geo.add_or_update_place location
            end
          end
        end
      end
      # had thought of adding locations to geo but its not really necessary
      # add_locations_to_topic_geo topic
    end

    # code updated 8 nov 2014
    def self.add_post_locations_to_geo_places
      MapTopic::LocationPost.all.each do |location_post|
        if location_post.post && location_post.post.topic.geo
          topic_geo = location_post.post.topic.geo
          unless topic_geo.places['sorted_ids'].include? location_post.location.id
            # binding.pry
            topic_geo.add_or_update_place location_post.location, location_post.post.id
          end
        else
          binding.pry
        end
      end

    end


    private


    def self.create_geo_for_topic topic

      if topic.location.city
        # topic_geo = MapTopic::TopicGeo.where(:topic_id => topic.id).first_or_create

        geo_key = MapTopic::GeoKey.where(:bounds_value => topic.location.city.downcase).first
        unless geo_key
          geo_key = MapTopic::GeoKey.create_from_geo_name  topic.location.city.downcase, "searched"
        end
        topic_geo = MapTopic::TopicGeo.create_from_geo_key geo_key, 'info'
        binding.pry
        topic_geo.topic_id = topic.id
        # topic.save!
        topic_geo.save!

        return topic_geo
        # topic_geo.bounds_value = geo_key.bounds_value
        # topic_geo.bounds_type = geo_key.bounds_type
        # topic_geo.bounds_range = geo_key.bounds_range
        # topic_geo.latitude = geo_key.latitude
        # topic_geo.longitude = geo_key.longitude
        # topic_geo.city_lower = geo_key.city_lower
        # topic_geo.country_lower = geo_key.country_lower
        # topic_geo.display_name = geo_key.display_name
        # topic_geo.capability = "info"
        # TODO - may add extra category to denote question capability

      else
        binding.pry
      end

    end


    # def self.add_locations_to_topic_geo topic
    #   geo_places = []
    #   topic.posts.each do |post|
    #     if post.location
    #       geo_places.push(
    #         {
    #           :post_id => post.id,
    #           :location_id => post.location.id

    #         }
    #       )
    #       binding.pry

    #     end
    #   end
    #   topic_geo = topic.geo
    #   topic_geo.places = geo_places
    #   topic_geo.save!
    # end

  end
end
