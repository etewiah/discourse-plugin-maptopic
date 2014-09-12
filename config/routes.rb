MapTopic::Engine.routes.draw do

  get "/map_topics" => "map_topics#index"
  get "/map_topics/set_location" => "map_topics#set_location"

end

