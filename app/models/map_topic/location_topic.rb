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

# below only needs to be run once
# get_nearest_location_to_request to find out which of the valid locations is closest
# to current user based on ip address
        def self.create_index_locations()
            berlin = MapTopic::LocationTopic.where({location_title: 'berlin', longitude: "13.4060912",
                                                    location_id: 0, topic_id: 0,  latitude: "52.519171"}).first_or_initialize
            berlin.save!
            birmingham = MapTopic::LocationTopic.where({location_title: 'birmingham', longitude: "-1.890401",
                                                        latitude: "52.48624299999999", location_id: 0, topic_id: 0}).first_or_initialize
            birmingham.save!
            london = MapTopic::LocationTopic.where({location_title: 'london', longitude: "-0.1198244",
                                                    latitude: "51.51121389999999", location_id: 0, topic_id: 0}).first_or_initialize
            london.save!
            madrid = MapTopic::LocationTopic.where({location_title: 'madrid', longitude: "-3.7037902",
                                                    latitude: "40.4167754", location_id: 0, topic_id: 0}).first_or_initialize
            madrid.save!
            porto = MapTopic::LocationTopic.where({location_title: 'porto', longitude: "-8.6239254",
                                                 latitude: "41.1566892", location_id: 0, topic_id: 0}).first_or_initialize
            porto.save!
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
