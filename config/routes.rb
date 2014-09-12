MapTopic::Engine.routes.draw do

  resource :admin_tag, path: "/admin", constraints: AdminConstraint.new do
      collection do
        post "merge" => "admin_tags#merge"
      end
    end
  get "/map_topics" => "map_topics#index"
  get "/tag/:tag" => "tags#get_topics_per_tag"
  get "/tags/cloud" => "tags#cloud"
  get "/tags/cloud/topic/:topic_id" => "tags#cloud_for_topic"
  get "/tags/cloud/category/:slug" => "tags#cloud_for_category"
  get "/tags/cloud/tag/:tag" => "tags#cloud_for_tag"
  get "/tags/info/:tag" => "tags#topic_info"
  get "/set_tags" => "tags#set_tags"
end


Rails.application.routes.draw do
  scope module: 'tagger' do
    get "/tag/:tag" => "tags#get_topics_per_tag"
    get "/tag/" => "tags#cloud"
  end
end