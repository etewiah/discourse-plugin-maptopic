module MapTopic
    class LocationSummarySerializer < ActiveModel::Serializer


        attributes :id, :title, :description, :address, :city, 
        :region, :postal_code, :country, :longitude, 
        :latitude, :topics_count,
        :gplace_id, :website_url
        # t.text :description
        # t.text :address
        # t.string :city
        # t.string :region
        # t.string :postal_code
        # t.string :country
        # t.float :longitude
        # t.float :latitude
        # t.integer :topics_count

        # defining a gig_slug as ember router will confuse slug here with playlist slug in playlist route
        # def gig_slug
        #   return self.slug
        # end

    end
end
