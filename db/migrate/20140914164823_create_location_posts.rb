class CreateLocationPosts < ActiveRecord::Migration
  def change
    create_table :location_posts do |t|
      t.string :location_title
      t.integer :location_id
      t.integer :post_id
      t.float :longitude
      t.float :latitude
      t.string :slug
    end
  end
end
