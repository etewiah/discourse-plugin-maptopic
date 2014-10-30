MapTopic::Engine.routes.draw do
  # get "/location_topics" => "location_topics#index"

  # might be more accurate for set_geo to be a method in location_topic controller
  post "/location_posts/set_geo" => "location_posts#set_geo"
  # below sets location where there is an associated post:
  post "/location_posts/set_location" => "location_posts#set_location"
  # below sets location on a topic without the need for a post to have been created
  post "/location_topics/set_location" => "location_topics#set_location"
  # get "/location_posts/update_location" => "location_posts#update_location"
  # get "/location_topics/update_location" => "location_topics#update_location"

# TODO - change get requests for above to post
  get "/geo_topics/get_geo_keys" => "geo_topics#get_geo_keys"
  get "/geo_topics/get_for_geo" => "geo_topics#get_for_geo"
  # get "/geo_topics/get_for_geo_2" => "geo_topics#get_for_geo_2"
# TODO - remove below:
  # get "/geo_topics/get_for_city" => "geo_topics#get_for_city"
# TODO - remove below:
  # get "/location_topics/get_for_city" => "location_topics#get_for_city"
  get "/location_topics/get_geocoder_location" => "location_topics#get_geocoder_location"
  get "/location_topics/get_req_location" => "location_topics#get_req_location"
  get "/location_topics/get_nl" => "location_topics#get_nl"
  get "/location_topics/get_remote_ip" => "location_topics#get_remote_ip"
  get "/location_topics/get_remote_addr" => "location_topics#get_remote_addr"
  # get "/location_topics/get_location" => "location_topics#get_location"


  # end point for routes that are only implemented client side
  # TODO - render useful serverside content for search engine etc..
  get "/map" => "location_topics#landing"
  get "/map/*path" => "location_topics#landing"


end
