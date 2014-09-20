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

    end
end
