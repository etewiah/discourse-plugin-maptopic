MapTopic::Engine.routes.draw do

  # get "/location_topics" => "location_topics#index"
  get "/location_posts/set_location" => "location_posts#set_location"
  get "/location_topics/set_location" => "location_topics#set_location"
  get "/location_topics/get_for_city" => "location_topics#get_for_city"


  # end point for routes that are only implemented client side
  # TODO - render useful serverside content for search engine etc..
  get "/map" => "location_topics#landing"
  get "/map/*path" => "location_topics#landing"


end
