MapTopic::Engine.routes.draw do

  get "/location_topics" => "location_topics#index"
  get "/location_topics/set_location" => "location_topics#set_location"

    get "/map" => "location_topics#index"
    get "/map/*path" => "location_topics#index"


end

