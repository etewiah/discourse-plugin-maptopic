require 'spec_helper'

describe MapTopic::LocationPostsController, type: :controller do
  let(:topic) { create_topic(title: "Poll: Chitoge vs Onodera") }
  let!(:post) { create_post(topic: topic, raw: "Pick one.\n\n[poll]\n* Chitoge\n* Onodera\n[/poll]") }
  let(:user1) { Fabricate(:user) }
  let(:user2) { Fabricate(:user) }
  let(:admin) { Fabricate(:admin) }


  describe 'set_location' do
    it "returns 403 if no user is logged in" do
      xhr :get, :set_location, post_id: post.id, option: "Chitoge", use_route: :poll
      response.should be_forbidden
    end
  end
  describe 'set_location' do
    it "returns 403 if no user is logged in" do
      log_in_user user1
      xhr :get, :set_location, post_id: post.id, option: "Chitoge", use_route: :poll
      binding.pry
      response.should be_forbidden
    end
  end

end

describe MapTopic::GeoTopicsController, type: :controller do
  let(:topic) { create_topic(title: "Poll: Chitoge vs Onodera") }
  let!(:post) { create_post(topic: topic, raw: "Pick one.\n\n[poll]\n* Chitoge\n* Onodera\n[/poll]") }
  let(:user1) { Fabricate(:user) }
  let(:user2) { Fabricate(:user) }
  let(:admin) { Fabricate(:admin) }
  # let(:geo_key) { MapTopic::GeoKey.create({city_lower: "berlin"}) }
  # above does not work

  describe 'get_geo_keys' do
    it "should return okay" do
      xhr :get, :get_geo_keys, post_id: post.id, option: "Chitoge", use_route: :poll
      # binding.pry
      response.status.should eq(200)
    end
  end

  describe 'get_for_city' do
    it "returns 400 when no GeoKeys exist" do
      xhr :get, :get_for_city, post_id: post.id, option: "Chitoge", use_route: :map_topic
      response.status.should eq(400)
    end
    it "returns city when default GeoKeys exists" do
      MapTopic::GeoKey.create({city_lower: "berlin"})
      xhr :get, :get_for_city, post_id: post.id, option: "Chitoge", use_route: :map_topic
      binding.pry
      response.status.should eq(200)
    end

  end
end


# describe PollPlugin::PollController, type: :controller do
#   let(:topic) { create_topic(title: "Poll: Chitoge vs Onodera") }
#   let!(:post) { create_post(topic: topic, raw: "Pick one.\n\n[poll]\n* Chitoge\n* Onodera\n[/poll]") }
#   let(:user1) { Fabricate(:user) }
#   let(:user2) { Fabricate(:user) }
#   let(:admin) { Fabricate(:admin) }

#   describe 'vote' do
#     it "returns 403 if no user is logged in" do
#       xhr :put, :vote, post_id: post.id, option: "Chitoge", use_route: :poll
#       response.should be_forbidden

#       #     "action_dispatch.request.request_parameters"=>
#       # {"post_id"=>"129", "option"=>"Chitoge", "controller"=>"poll_plugin/poll", "action"=>"vote"},
#     end

#     it "returns 400 if post_id or invalid option is not specified" do
#       log_in_user user1
#       xhr :put, :vote, use_route: :poll
#       response.status.should eq(400)
#       xhr :put, :vote, post_id: post.id, use_route: :poll
#       response.status.should eq(400)
#       xhr :put, :vote, option: "Chitoge", use_route: :poll
#       response.status.should eq(400)
#       xhr :put, :vote, post_id: post.id, option: "Tsugumi", use_route: :poll
#       response.status.should eq(400)
#     end

#     it "returns 400 if post_id doesn't correspond to a poll post" do
#       log_in_user user1
#       post2 = create_post(topic: topic, raw: "Generic reply")
#       xhr :put, :vote, post_id: post2.id, option: "Chitoge", use_route: :poll
#     end

#     it "saves votes correctly" do
#       MessageBus.expects(:publish).times(3)

#       log_in_user user1
#       xhr :put, :vote, post_id: post.id, option: "Chitoge", use_route: :poll
#       PollPlugin::Poll.new(post).get_vote(user1).should eq("Chitoge")

#       log_in_user user2
#       xhr :put, :vote, post_id: post.id, option: "Onodera", use_route: :poll
#       PollPlugin::Poll.new(post).get_vote(user2).should eq("Onodera")

#       PollPlugin::Poll.new(post).details["Chitoge"].should eq(1)
#       PollPlugin::Poll.new(post).details["Onodera"].should eq(1)

#       xhr :put, :vote, post_id: post.id, option: "Chitoge", use_route: :poll
#       PollPlugin::Poll.new(post).get_vote(user2).should eq("Chitoge")

#       PollPlugin::Poll.new(post).details["Chitoge"].should eq(2)
#       PollPlugin::Poll.new(post).details["Onodera"].should eq(0)
#     end
#   end

#   describe 'toggle_close' do
#     it "returns 400 if post_id doesn't correspond to a poll post" do
#       log_in_user admin
#       post2 = create_post(topic: topic, raw: "Generic reply")
#       xhr :put, :toggle_close, post_id: post2.id, use_route: :poll
#       response.status.should eq(400)
#     end

#     it "returns 400 if the topic is locked" do
#       log_in_user admin
#       topic.update_attributes closed: true
#       xhr :put, :toggle_close, post_id: post.id, use_route: :poll
#       response.status.should eq(400)
#     end

#     it "raises Discourse::InvalidAccess is the user is not authorized" do
#       log_in_user user1
#       expect do
#         xhr :put, :toggle_close, post_id: post.id, use_route: :poll
#       end.to raise_error(Discourse::InvalidAccess)
#     end

#     it "renames the topic" do
#       I18n.stubs(:t).with('poll.prefix').returns("Poll ")
#       I18n.stubs(:t).with('poll.closed_prefix').returns("Closed Poll ")
#       log_in_user admin
#       xhr :put, :toggle_close, post_id: post.id, use_route: :poll
#       response.status.should eq(200)
#       topic.reload.title.should == "Closed Poll : Chitoge vs Onodera"
#       xhr :put, :toggle_close, post_id: post.id, use_route: :poll
#       response.status.should eq(200)
#       topic.reload.title.should == "Poll : Chitoge vs Onodera"
#     end
#   end
# end
