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



  end
end
