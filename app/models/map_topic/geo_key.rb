module MapTopic
    class GeoKey < ActiveRecord::Base
        self.table_name = "geo_keys"
        # reverse_geocoded_by :latitude, :longitude

      # t.string :display_name
      # t.float :longitude
      # t.float :latitude
      # t.string :bounds_type
      # t.string :bounds_value
      # t.integer :bounds_range
      # t.string :country_lower
      # t.string :city_lower
      # t.string :show_criteria

    end
end
