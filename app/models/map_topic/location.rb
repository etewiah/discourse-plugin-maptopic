module MapTopic
    class Location < ActiveRecord::Base
        self.table_name = "locations"

        reverse_geocoded_by :latitude, :longitude

        geocoded_by :full_address
        after_validation :reverse_geocode

        # the full_address method
        def full_address
            "#{address}, #{postal_code}, #{city}, #{country}"
        end

        has_many :location_topics
        # , class_name: "::Blog::GigTopic"
        has_many :topics, through: :location_topics
        has_many :location_posts
        has_many :posts, through: :location_posts

        #     t.string :title
        # t.text :description
        # t.text :address
        # t.string :city
        # t.string :region
        # t.string :postal_code
        # t.string :country
        # t.float :longitude
        # t.float :latitude
        # t.integer :topics_count

    end
end
