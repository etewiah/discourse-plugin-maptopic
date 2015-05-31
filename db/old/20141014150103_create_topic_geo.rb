class CreateTopicGeo < ActiveRecord::Migration
  def change
    create_table :topic_geos do |t|
      t.string :display_name
      t.integer :topic_id
      t.float :longitude
      t.float :latitude
      t.string :bounds_type
      t.string :bounds_value
      t.integer :bounds_range
      t.string :country_lower
      t.string :country_code
      t.string :city_lower
      t.text :places
      t.text :happening
      t.text :poll
      t.datetime :hot_from
      t.datetime :hot_till
      t.string :capability
    end
    add_index :topic_geos, :city_lower
    add_index :topic_geos, :hot_till
    add_index :topic_geos, :hot_from

  end
end
