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
