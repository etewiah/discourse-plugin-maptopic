

  # FakeWeb.allow_net_connect = true
  # Net::HTTP.get(URI.parse("http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=52.48624299999999%2C-1.890401&sensor=false"))
  # req = FakeWeb.last_request  # => Net::HTTP::Get request object
  # http://technicalpickles.com/posts/stop-net-http-dead-in-its-tracks-with-fakeweb/
  geocoded_birmingham_file = File.expand_path("./plugins//discourse-plugin-maptopic/spec/fixtures/geocoded_birmingham.json")
  geocoded_birmingham_uri_1 = "http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=52.486243%2C-1.890401&sensor=false"
  geocoded_birmingham_uri_2 = "http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=52.48624299999999%2C-1.890401&sensor=false"
  geocoded_birmingham_uri_3 = "http://maps.googleapis.com/maps/api/geocode/json?address=birmingham&language=en&sensor=false"
# http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=52.4858915%2C-1.8901512&sensor=false
  FakeWeb.register_uri(:any, geocoded_birmingham_uri_1, :response => geocoded_birmingham_file)
  FakeWeb.register_uri(:any, geocoded_birmingham_uri_2, :response => geocoded_birmingham_file)
  FakeWeb.register_uri(:any, geocoded_birmingham_uri_3, :response => geocoded_birmingham_file)



RSpec.configure do |rspec|
  rspec.deprecation_stream = '/dev/null'
  # or
  # rspec.deprecation_stream = File.open("/path/to/file", "w")
end