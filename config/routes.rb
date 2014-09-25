MapTopic::Engine.routes.draw do

  # get "/location_topics" => "location_topics#index"
  get "/location_posts/set_location" => "location_posts#set_location"
  get "/location_topics/set_location" => "location_topics#set_location"
  get "/location_topics/get_for_city" => "location_topics#get_for_city"
  get "/location_topics/get_geocoder_location" => "location_topics#get_geocoder_location"
  get "/location_topics/get_req_location" => "location_topics#get_req_location"
  get "/location_topics/get_nl" => "location_topics#get_nl"
  get "/location_topics/get_remote_ip" => "location_topics#get_remote_ip"
  get "/location_topics/get_remote_addr" => "location_topics#get_remote_addr"


  # end point for routes that are only implemented client side
  # TODO - render useful serverside content for search engine etc..
  get "/map" => "location_topics#landing"
  get "/map/*path" => "location_topics#landing"


end
