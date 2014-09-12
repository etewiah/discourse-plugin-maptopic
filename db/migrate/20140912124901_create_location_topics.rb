class CreateLocationTopics < ActiveRecord::Migration
  def change
    create_table :location_topics do |t|
      t.string :location_title
      t.integer :location_id
      t.integer :topic_id
      t.float :longitude
      t.float :latitude
    end
  end
end
