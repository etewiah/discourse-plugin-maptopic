module MapTopic
    class LocationPost < ActiveRecord::Base
        self.table_name = "location_posts"

        belongs_to :post
        belongs_to :location

        # t.string :location_title
        # t.integer :location_id
        # t.integer :post_id
        # t.float :longitude
        # t.float :latitude


    end
end
