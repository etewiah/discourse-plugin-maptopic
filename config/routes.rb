MapTopic::Engine.routes.draw do
  # get "/location_topics" => "location_topics#index"

  post "/geo_topics/update_geo_places" => "geo_topics#update_geo_places"
  # might be more accurate for set_geo to be a method in geo_topics controller
  post "/location_posts/set_geo" => "location_posts#set_geo"
  # below sets location where there is an associated post:
  post "/location_posts/set_location" => "location_posts#set_location"
  # below sets location on a topic without the need for a post to have been created
  post "/location_topics/set_location" => "location_topics#set_location"
  # get "/location_posts/update_location" => "location_posts#update_location"
  # get "/location_topics/update_location" => "location_topics#update_location"

  get "/geo_topics/get_geo_key" => "geo_topics#get_geo_key"
  get "/geo_topics/get_geo_keys" => "geo_topics#get_geo_keys"
  get "/geo_topics/get_for_geo" => "geo_topics#get_for_geo"

  get "/locations/get_for_geo" => "locations#get_for_geo"
  get "/locations/get_details" => "locations#get_details"

  # TODO - remove all of below below:
  get "/location_topics/get_geocoder_location" => "location_topics#get_geocoder_location"
  get "/location_topics/get_req_location" => "location_topics#get_req_location"
  get "/location_topics/get_nl" => "location_topics#get_nl"
  get "/location_topics/get_remote_ip" => "location_topics#get_remote_ip"
  get "/location_topics/get_remote_addr" => "location_topics#get_remote_addr"


  # end point for routes that are only implemented client side
  # TODO - render useful serverside content for search engine etc..
  get "/map" => "location_topics#landing"
  get "/map/*path" => "location_topics#landing"
  get "/manage/user_geo_keys" => "location_topics#landing"
  get "/manage" => "location_topics#landing"
  get "/pl" => "location_topics#landing"
  get "/pl/*path" => "location_topics#landing"
  get "/places" => "location_topics#landing"
  get "/places/*path" => "location_topics#landing"


end
