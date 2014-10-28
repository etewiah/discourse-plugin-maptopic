require 'spec_helper'
require './plugins//discourse-plugin-maptopic/spec/map_topic_spec_helper'
# require File.dirname(__FILE__) + '/../spec_helper'
birmingham_geo_json_file = File.read("./plugins//discourse-plugin-maptopic/spec/fixtures/birmingham_geo.json")
birmingham_location_object_json_file = File.read("./plugins//discourse-plugin-maptopic/spec/fixtures/birmingham_location_object.json")

describe MapTopic::LocationPostsController, type: :controller do
  let(:topic) { create_topic(title: "Poll: Chitoge vs Onodera") }
  let!(:post) { create_post(topic: topic, raw: "Pick one.\n\n[poll]\n* Chitoge\n* Onodera\n[/poll]") }
  let(:user1) { Fabricate(:user) }
  let(:user2) { Fabricate(:user) }
  let(:admin) { Fabricate(:admin) }
  let(:birmingham_json) {{
                           displayString: 'Birmingham',
                           value: 'birmingham',
                           longitude: "-1.890401",
                           latitude: "52.48624299999999"
  }}
  let(:birmingham_geo_json) { JSON.parse birmingham_geo_json_file  }
  # let(:birmingham_location_object_json) { JSON.parse birmingham_location_object_json_file  }


  context 'set_location' do
    context 'where user is not logged in ' do
      it "returns 403 if no user is logged in" do
        xhr :get, :set_location, post_id: post.id,  use_route: :map_topic
        response.should be_forbidden
      end
    end

    context 'where user is logged in ' do
      # let(:p2) { Fabricate(:post, user: user1) }
      before do
        log_in_user user1
      end
      it "returns 400 if location missing" do
        xhr :get, :set_location, post_id: post.id,  use_route: :map_topic
        puts ::JSON.parse(response.body)
        response.status.should eq(400)
      end
      it "returns 403 if user does not have permission to edit post" do
        xhr :get, :set_location, post_id: post.id, location: {},  use_route: :map_topic
        # puts ::JSON.parse(response.body)
        response.status.should eq(403)
      end

      context ' and user has created topic being passed in ' do
        let(:topic2) { create_topic(title: "Topic with location", user: user1) }
        let!(:post2) { create_post(topic2: topic, raw: "Pick one.\n\n[poll]\n* Chitoge\n* Onodera\n[/poll]", user: user1) }
        # let(:p2) { Fabricate(:post, user: user1) }


        it "creates location and assigns it to post " do
          xhr :get, :set_location, post_id: post2.id, location: birmingham_json, use_route: :map_topic
          result = ::JSON.parse(response.body)
          post2.location.id.should == result['id']
          response.status.should eq(200)
        end

        it "creates location and assigns it to topic " do
          pending "implementation"
        end

      end

    end
  end


  context 'set_geo' do
    routes { MapTopic::Engine.routes }

    it "returns 400 if geo param missing" do
      log_in_user user1
      xhr :get, :set_geo, post_id: post.id,  use_route: :map_topic
      response.status.should eq(400)
    end

    context 'where user created topic' do
      # let(:t1) { Fabricate(:topic, user: user1) }
      let(:p1) { Fabricate(:post, user: user1) }
      before do
        log_in_user user1
        xhr :get, :set_geo, post_id: p1.id, geo: birmingham_geo_json
        # { :ids => ["song-section-5", "song-section-4", "song-section-6"] }
      end

      it 'returns relevant TopicGeo' do
        response.should be_success
        result = ::JSON.parse(response.body)
        result['city_lower'].should == "birmingham"
        result['id'] == MapTopic::TopicGeo.last.id
      end

      it 'creates a geo for the topic' do
        assigns(:post).topic.geo.should== MapTopic::TopicGeo.last
      end

      it 'creates relevant GeoKey' do
        MapTopic::GeoKey.last.city_lower.should == "birmingham"
      end

      it 'assigns default location' do
        assigns(:post).location.should == MapTopic::Location.last
        # pending "implementation"
      end
    end

    describe 'setting location for a post' do
      # it "returns 403 if no user is logged in" do
      #   xhr :get, :set_location, post_id: post.id,  use_route: :baa
      #   response.should be_forbidden
      # end


      # it "returns 400 if location missing" do
      #   log_in_user user1
      #   xhr :get, :set_location, post_id: post.id,  use_route: :map_topic
      #   # binding.pry
      #   response.status.should eq(400)
      # end
      # it "returns 403 if user does not have permission to edit post" do
      #   log_in_user user1
      #   xhr :get, :set_location, post_id: post.id, location: {},  use_route: :map_topic
      #   response.status.should eq(403)
      # end

      # context 'success' do
      #   let(:p2) { Fabricate(:post, user: user1) }

      #   before do
      #     log_in_user user1
      #     xhr :get, :set_location, post_id: p2.id, location: birmingham_json,  use_route: :map_topic
      #   end

      #   it "returns success" do

      #     response.should be_success
      #     result = ::JSON.parse(response.body)
      #     result['city'].should == "birmingham"
      #     # result['success'].should == true
      #     # result['url'].should be_present
      #   end
      # end

    end

  end
end


  