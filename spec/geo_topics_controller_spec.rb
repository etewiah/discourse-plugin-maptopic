require 'spec_helper'
require './plugins/discourse-plugin-maptopic/spec/map_topic_spec_helper'
require './plugins/discourse-plugin-maptopic/spec/vcr_setup'



describe MapTopic::GeoTopicsController, type: :controller do
  let(:topic) { create_topic(title: "Poll: Chitoge vs Onodera") }
  let!(:post) { create_post(topic: topic, raw: "Pick one.\n\n[poll]\n* Chitoge\n* Onodera\n[/poll]") }
  let(:user1) { Fabricate(:user) }
  let(:user2) { Fabricate(:user) }
  let(:admin) { Fabricate(:admin) }
  # let(:geo_key) { MapTopic::GeoKey.create({city_lower: "berlin"}) }
  # above does not work

  # describe "GET index" do
  #   it "assigns all posts as @posts" do
  #     Posts::Post.stub(:all) { [mock_post] }
  #      get :index
  #      assigns(:posts).should eq([mock_post])
  #   end
  # end

  describe 'get_geo_keys' do
    # get array of keys representing areas (typically cities) that can be displayed on a map
    # TODO - add validations and model tests to ensure that they always have a longitude and latitude
    it "should return okay" do
      xhr :get, :get_geo_keys,  use_route: :baa
      # binding.pry
      response.status.should eq(200)
    end

    it "should all have longitudes and latitudes" do
      pending("implementaion")
      fail
    end

    it "should only return keys marked standard by default" do
      pending("implementaion")
    end

    context 'with one key created' do

      before do
        MapTopic::GeoKey.create({city_lower: "berlin"})
        xhr :get, :get_geo_keys, use_route: :map_topic
      end


      it "returns one item" do

        response.should be_success
        result = ::JSON.parse(response.body)
        result.count.should == 1
        # result['city'].should == "birmingham"
        # result['success'].should == true
        # result['url'].should be_present
      end
    end

  end

  describe 'get_for_city' do


    context 'when some GeoKeys exists' do
      before(:each) do
        # berlin has been hard coded as default city in geo_topics_controller
        # TODO - fix that
        MapTopic::GeoKey.create({city_lower: "berlin"})
        MapTopic::GeoKey.create({city_lower: "london"})
      end

      context 'and ip address is passed which does not match any existing city' do
        before(:each) do
          australian_ip = "203.161.118.209"
          request.remote_addr = australian_ip
        end

        context 'and no city is specified' do
          before(:each) do
            VCR.use_cassette 'freegeoip' do
              xhr :get, :get_for_city, use_route: :map_topic
            end
            # result = ::JSON.parse(response.body)
          end

          it 'returns default city' do
            result = ::JSON.parse(response.body)
            result['geo_key']['city_lower'].should == "berlin"
          end
        end
      end

      context 'and a city is specified for which a GeoKey exists' do
        it "returns that city" do
          xhr :get, :get_for_city, city: "berlin", use_route: :map_topic
          result = ::JSON.parse(response.body)
          result['geo_key']['city_lower'].should == "berlin"
        end
      end

      context "and a city is specified for which no GeoKey exists" do
        it "creates and returns geo_key for city requested" do
          xhr :get, :get_for_city, city: 'birmingham', use_route: :map_topic
          result = ::JSON.parse(response.body)
          result['geo_key']['city_lower'].should == "birmingham"
          MapTopic::GeoKey.last.city_lower.should == "birmingham"
        end
      end

      context "and an invalid city value is passes" do
        it 'returns default city' do
          VCR.use_cassette 'geocoded_gibberrrrissssh' do
            xhr :get, :get_for_city, city: 'gibberrrrissssh', use_route: :map_topic
          end
          result = ::JSON.parse(response.body)
          result['geo_key']['city_lower'].should == "berlin"
        end
      end
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
