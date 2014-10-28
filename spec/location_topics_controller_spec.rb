require 'spec_helper'
require './plugins//discourse-plugin-maptopic/spec/map_topic_spec_helper'

birmingham_geo_json_file = File.read("./plugins//discourse-plugin-maptopic/spec/fixtures/birmingham_geo.json")
birmingham_location_object_json_file = File.read("./plugins//discourse-plugin-maptopic/spec/fixtures/birmingham_location_object.json")

describe MapTopic::LocationTopicsController, type: :controller do
  routes { MapTopic::Engine.routes }

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
        xhr :get, :set_location, topic_id: topic.id
        response.should be_forbidden
      end
    end

    context 'where user is logged in ' do
      # let(:p2) { Fabricate(:post, user: user1) }
      before do
        log_in_user user1
      end
      it "returns 400 if location missing" do
        xhr :get, :set_location, topic_id: topic.id,  use_route: :map_topic
        puts ::JSON.parse(response.body)
        response.status.should eq(400)
      end
      it "returns 403 if user does not have permission to edit post" do
        xhr :get, :set_location, topic_id: topic.id, location: {},  use_route: :map_topic
        # puts ::JSON.parse(response.body)
        response.status.should eq(403)
      end

      context ' and user has created topic being passed in ' do
        let(:topic2) { create_topic(title: "Topic with location", user: user1) }
        # let(:p2) { Fabricate(:post, user: user1) }


        it "creates location and assigns it to topic " do
          xhr :get, :set_location, topic_id: topic2.id, location: birmingham_json, use_route: :map_topic
          result = ::JSON.parse(response.body)
          Topic.last.location.id.should == result['id']
          response.status.should eq(200)
        end

      end

    end
  end


end
