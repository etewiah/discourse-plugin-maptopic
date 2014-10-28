module MapTopic
    class GeoKey < ActiveRecord::Base
        self.table_name = "geo_keys"
        serialize :geometry, JSON

        # city may be duplicated but bounds_value has to always stay unique - eg:
        # could have bounds_values of madrid_center and madrid_region ...
        validates_uniqueness_of :bounds_value
        after_validation :reverse_geocode, :unless => :has_geo_data?
        # reverse_geocoded_by :latitude, :longitude
        #   after_validation :reverse_geocode, :if => :has_coordinates

        def has_geo_data?
            self.city_lower? && self.country_lower?
        end
        # http://stackoverflow.com/questions/13433865/geocoding-addresses-with-geocoder-gem-and-postgis-database-with-rgeo
        reverse_geocoded_by :latitude, :longitude do |obj, results|
            binding.pry
            # get here when I run
            # rake geocode:all CLASS=MapTopic::GeoKey SLEEP=2.25 BATCH=5
            # all this just to add country, but worthwhile...
            if geo = results.first
                obj.city_lower = geo.city ?  geo.city.downcase : obj.city_lower
                # obj.address = geo.formatted_address ? geo.formatted_address : obj.address
                # geo.street_address
                obj.country_lower = geo.country ? geo.country.downcase : obj.country_lower
                # obj.postal_code = geo.postal_code ? geo.postal_code : obj.postal_code
                # obj.region = geo.state ? geo.state : obj.region
            end
        end


        def self.create_from_geo geo_name, show_criteria
            results = Geocoder.search(geo_name)
            if geo = results.first
                if geo.city
                    # bounds_value = geo.city.downcase
                    display_name = geo.city.titleize
                    bounds_type = "city"
                    city_lower = geo.city.downcase
                else
                    # if I don't add both city_lower and country_lower, geocoder will be called again
                    # in after_validation callback

                    city_lower = "unknown"
                    if geo.types.include? 'country'
                        # bounds_value = geo.country.downcase
                        bounds_type = "country"
                        display_name = geo.country.titleize
                    else
                        # bounds_value = geo.country
                        display_name = "unknown"
                        bounds_type = "unknown"
                    end

                end
                # bounds value is the geo_name passed in
                # reason for this is that bounds_value cannot be duplicated but geo_name could be misspelt
                # I want a new record with each misspell - even though I will have duplicate data in db
                # it will avoid an un-necessary trip to geocoder

                # when I create a topic_geo from a geo_key, should use city_lower or country_lower
                # for the bounds_value
                geo_key = MapTopic::GeoKey.create({
                                                    display_name: display_name,
                                                    bounds_type: bounds_type,
                                                    bounds_value: geo_name,
                                                    city_lower: city_lower,
                                                    country_lower: geo.country.downcase,
                                                    show_criteria: show_criteria,
                                                    longitude: geo.longitude,
                                                    latitude: geo.latitude,
                                                    geometry: geo.geometry
                })
                # binding.pry
                # TODO - add country code
                #                                                     country_code: geo.country_code
                # if for some reason a GeoKey gets created with a duplicate bounds_value, valid object will be returned
                # but it will not have an id and not GeoKey will not have been saved

            end
        end
        # TODO - remove below
        def self.create_from_city city_name
            # TODO - add bounds json text field that will store the full bounds of the result
            # bounds_range: 20 makes no sense so not bothering with that anymore
            results = Geocoder.search(city_name)
            if geo = results.first
                if geo.city
                    bounds_value = geo.city.downcase
                    bounds_type = "city"
                else
                    if geo.types.include? 'country'
                        bounds_value = geo.country.downcase
                        bounds_type = "country"
                    else
                        bounds_value = geo.country
                        bounds_type = "unknown"
                    end

                end
                # because geocoder will find a misspelt city like accrra, prefer its city to my input
                city_name = geo.city ?  geo.city.downcase : city_name.downcase
                geo_key = MapTopic::GeoKey.create({
                                                    display_name: bounds_value.titleize,
                                                    bounds_type: bounds_type,
                                                    bounds_value: bounds_value,
                                                    city_lower: city_name,
                                                    country_lower: geo.country.downcase,
                                                    show_criteria: "searched",
                                                    longitude: geo.longitude,
                                                    latitude: geo.latitude,
                                                    geometry: geo.geometry
                })
                # TODO - add country code
                #                                                     country_code: geo.country_code


            end
        end


        # t.string :display_name
        # t.float :longitude
        # t.float :latitude
        # t.string :bounds_type
        # t.string :bounds_value
        # t.integer :bounds_range
        # t.string :country_lower
        # t.string :city_lower
        # t.string :show_criteria

    end
end
