# run “MapTopic::Jobs.migrate_geo_key_values" from console
module MapTopic
  class Jobs
    # include Sidekiq::Worker

    require 'pry'


    # only need to run this once to migrate geo_keys which had previously been created as locationtopics..
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

    # only need to run this once to migrate geo_keys which had previously been created as locationtopics..
    def self.migrate_topic_geo_values

      # topic = Topic.find(12)
      Topic.all.each do |topic|
        create_geo_for_topic topic
      end

      # had thought of adding locations to geo but its not really necessary
      # add_locations_to_topic_geo topic

    end

    private

    def self.add_locations_to_topic_geo topic
      geo_places = []
      topic.posts.each do |post|
        if post.location
          geo_places.push(
            {
              :post_id => post.id,
              :location_id => post.location.id

            }
          )
          binding.pry

        end
      end
      topic_geo = topic.geo
      topic_geo.places = geo_places
      topic_geo.save!
    end

    def self.create_geo_for_topic topic

      if topic.location && topic.location.city
        topic_geo = MapTopic::TopicGeo.where(:topic_id => topic.id).first_or_create

        geo_key = MapTopic::GeoKey.where(:bounds_value => topic.location.city.downcase).first
        if geo_key
          topic_geo.bounds_value = geo_key.bounds_value
          topic_geo.bounds_type = geo_key.bounds_type
          topic_geo.bounds_range = geo_key.bounds_range
          topic_geo.latitude = geo_key.latitude
          topic_geo.longitude = geo_key.longitude
          topic_geo.city_lower = geo_key.city_lower
          topic_geo.country_lower = geo_key.country_lower
          topic_geo.display_name = geo_key.display_name
          topic_geo.capability = "info"
# TODO - may add extra category to denote question capability
        else
          binding.pry
        end
        topic_geo.save!
      end

    end

  end
end
