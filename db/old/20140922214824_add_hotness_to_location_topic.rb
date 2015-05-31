class AddHotnessToLocationTopic < ActiveRecord::Migration
  def change
    add_column :location_topics, :hotness, :string
    add_column :location_topics, :city, :string
    add_column :location_topics, :country, :string
    add_column :location_topics, :created_at, :datetime
    add_column :location_topics, :updated_at, :datetime
  end
end
