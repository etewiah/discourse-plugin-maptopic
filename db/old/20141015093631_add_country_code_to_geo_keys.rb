class AddCountryCodeToGeoKeys < ActiveRecord::Migration
  def change
    add_column :geo_keys, :country_code, :string
  end
end
