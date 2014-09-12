class CreateLocations < ActiveRecord::Migration
  def change
    create_table :locations do |t|
      t.string :title
      t.text :description
      t.text :address
      t.string :city
      t.string :region
      t.string :postal_code
      t.string :country
      t.float :longitude
      t.float :latitude
      t.integer :topics_count
    end
  end
end
