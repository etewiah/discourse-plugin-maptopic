

  # FakeWeb.allow_net_connect = true
  # Net::HTTP.get(URI.parse("http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=52.48624299999999%2C-1.890401&sensor=false"))
  # req = FakeWeb.last_request  # => Net::HTTP::Get request object
  # http://technicalpickles.com/posts/stop-net-http-dead-in-its-tracks-with-fakeweb/
  geocoded_birmingham_file = File.expand_path("./plugins//discourse-plugin-maptopic/spec/fixtures/geocoded_birmingham.json")
  geocoded_birmingham_location_object_file = File.expand_path("./plugins//discourse-plugin-maptopic/spec/fixtures/geocoded_birmingham_location_object.json")
  geocoded_birmingham_uri_1 = "http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=52.486243%2C-1.890401&sensor=false"
  geocoded_birmingham_uri_2 = "http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=52.48624299999999%2C-1.890401&sensor=false"
  geocoded_birmingham_uri_3 = "http://maps.googleapis.com/maps/api/geocode/json?address=birmingham&language=en&sensor=false"
  geocoded_birmingham_location_object_uri_1 = "http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=52.455709%2C-1.886135999999965&sensor=false"

# http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=52.4858915%2C-1.8901512&sensor=false
  FakeWeb.register_uri(:any, geocoded_birmingham_uri_1, :response => geocoded_birmingham_file)
  FakeWeb.register_uri(:any, geocoded_birmingham_uri_2, :response => geocoded_birmingham_file)
  FakeWeb.register_uri(:any, geocoded_birmingham_uri_3, :response => geocoded_birmingham_file)
  FakeWeb.register_uri(:any, geocoded_birmingham_location_object_uri_1, :response => geocoded_birmingham_location_object_file)



RSpec.configure do |rspec|
  rspec.deprecation_stream = '/dev/null'
  # or
  # rspec.deprecation_stream = File.open("/path/to/file", "w")
end

def get_json_from_fixture file_name
  json_file = File.read("./plugins//discourse-plugin-maptopic/spec/fixtures/#{file_name}.json")
  return JSON.parse json_file 
end

# TODO - improve this
def create_brum_location
  location = MapTopic::Location.new()
  location.latitude = "52.455709"
  location.longitude = "-1.886135999999965"
  location.save!
  return location
end