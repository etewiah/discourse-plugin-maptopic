class AddGeometryToGeoKeysAndTopicGeos < ActiveRecord::Migration
  def change
    add_column :geo_keys, :geometry, :text
    add_column :topic_geos, :geometry, :text
  end
end
