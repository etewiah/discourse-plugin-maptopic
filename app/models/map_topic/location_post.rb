module MapTopic
  class LocationPost < ActiveRecord::Base
    self.table_name = "location_posts"
    reverse_geocoded_by :latitude, :longitude
    # TODO - include cols which I will use for quering here
    # starting with city..
    belongs_to :post
    belongs_to :location



    # effectively creating the connection between a post and a location
    def self.create_from_location location, post
      # currently I am only creating 1 location per post hence "first_or_ini..." instead of .new()
      # this might change in the future to allow multiple locations per post
      location_post = MapTopic::LocationPost.where(:post_id => post.id).first_or_initialize
      location_post.location_title = location.title
      location_post.longitude = location.longitude
      location_post.latitude = location.latitude
      location_post.location_id = location.id

      location_post.save!

      # below ensures that each location for a post has a corresponding location in the topic
      location_topic = MapTopic::LocationTopic.create_from_location location, post.topic, post.id

      # - moved below to  create_from_location in LocationTopic
      # if post.topic.geo
      #   # ensures place json includes post location
      #   post.topic.geo.add_or_update_place location, post.id
      # end

      return location_post
    end

    # t.string :location_title
    # t.integer :location_id
    # t.integer :post_id
    # t.float :longitude
    # t.float :latitude


  end
end
