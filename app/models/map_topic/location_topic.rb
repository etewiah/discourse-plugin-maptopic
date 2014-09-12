module MapTopic
    class LocationTopic < ActiveRecord::Base
        self.table_name = "location_topics"

        belongs_to :topic
        belongs_to :location

        # t.string :location_title
        # t.integer :location_id
        # t.integer :topic_id
        # t.float :longitude
        # t.float :latitude


    end
end
