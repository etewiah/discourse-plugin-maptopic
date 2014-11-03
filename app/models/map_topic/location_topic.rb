module MapTopic
  class LocationTopic < ActiveRecord::Base
    self.table_name = "location_topics"
    reverse_geocoded_by :latitude, :longitude

    belongs_to :topic
    belongs_to :location

    # t.string :location_title
    # t.integer :location_id
    # t.integer :topic_id
    # t.float :longitude
    # t.float :latitude



    def self.create_from_location location, topic_id

      location_topic = MapTopic::LocationTopic.new()
      location_topic.topic_id = topic_id
      # do I need to ensuer city and country are downcased?
      location_topic.city = location.city
      location_topic.country = location.country
      location_topic.location_title = location.title
      location_topic.longitude = location.longitude
      location_topic.latitude = location.latitude
      location_topic.location_id = location.id
      location_topic.save!

      # topic_geo = Topic.find(topic_id).geo
      # if topic_geo
      #     topic_places = topic_geo.places || []
      #     # TODO - ensure there are no duplicates...
      #     # in future, will stop using LocationTopic and rely on topic.geo.places
      #     # should be a bit quicker and more efficient.
      #     # LocationPosts will still be around for any queries etc that might be needed
      #     #  - will add topic_id to locationposts..
      #     topic_places.push location_topic.as_json
      #     topic_geo.places = topic_places
      #     topic_geo.save!
      # end
      return location_topic
    end


    # only need to run this once to correct error in setting primary_post location
    def self.ensure_each_location_topic_has_location_post
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

  end
end
