class CreateGeoKeys < ActiveRecord::Migration
  # perhaps I should add country_code too
  def change
    create_table :geo_keys do |t|
      t.string :display_name
      t.float :longitude
      t.float :latitude
      t.string :bounds_type
      t.string :bounds_value
      t.integer :bounds_range
      t.string :country_lower
      t.string :city_lower
      t.string :show_criteria
    end
  end
end
