class GeocoderMaxmindGeoliteCity < ActiveRecord::Migration
  def self.up
    create_table :maxmind_geolite_city_blocks, id: false do |t|
      t.column :start_ip_num, :bigint, null: false
      t.column :end_ip_num, :bigint, null: false
      t.column :loc_id, :bigint, null: false
    end
    add_index :maxmind_geolite_city_blocks, :start_ip_num, unique: true

    create_table :maxmind_geolite_city_location, id: false do |t|
      t.column :loc_id, :bigint, null: false
      t.string :country, null: false
      t.string :region, null: false
      t.string :city
      t.string :postal_code, null: false
      t.float :latitude
      t.float :longitude
      t.integer :metro_code
      t.integer :area_code
    end
    add_index :maxmind_geolite_city_location, :loc_id, unique: true
  end

  def self.down
    drop_table :maxmind_geolite_city_location
    drop_table :maxmind_geolite_city_blocks
  end
end
