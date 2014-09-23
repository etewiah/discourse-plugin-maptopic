class AddSlugToLocation < ActiveRecord::Migration
  def change
    add_column :locations, :slug, :string
    add_column :locations, :gplace_id, :string
    add_column :locations, :website_url, :string
    add_column :locations, :created_at, :datetime
    add_column :locations, :updated_at, :datetime

  end
end
