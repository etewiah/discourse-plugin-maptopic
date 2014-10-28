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
        result[0]['city_lower'] == "berlin"
        # result['city'].should == "birmingham"
        # result['success'].should == true
        # result['url'].should be_present
      end
    end

  end


# no longer using get_for_geo
# now get for geo
  describe 'get_for_geo' do

    context 'when some GeoKeys exists' do
      before(:each) do
        # berlin has been hard coded as default city in geo_topics_controller
        # TODO - fix that
        MapTopic::GeoKey.create({city_lower: "berlin", bounds_value: "berlin"})
        MapTopic::GeoKey.create({city_lower: "london", bounds_value: "london"})
      end

      context 'and ip address is passed which does not match any existing city' do
        before(:each) do
          australian_ip = "203.161.118.209"
          request.remote_addr = australian_ip
        end

        context 'and no city is specified' do
          before(:each) do
            VCR.use_cassette 'freegeoip' do
              xhr :get, :get_for_geo, use_route: :map_topic
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
          xhr :get, :get_for_geo, geo: "berlin", use_route: :map_topic
          result = ::JSON.parse(response.body)
          result['geo_key']['city_lower'].should == "berlin"
        end
      end

      context "and a city is specified for which no GeoKey exists" do
        it "should create and return geo_key for city requested" do
          xhr :get, :get_for_geo, geo: 'birmingham', use_route: :map_topic
          result = ::JSON.parse(response.body)
          result['geo_key']['city_lower'].should == "birmingham"
          MapTopic::GeoKey.last.city_lower.should == "birmingham"
        end
      end

      context "and an invalid city value is passes" do
        it 'returns default city' do
          VCR.use_cassette 'geocoded_gibberrrrissssh' do
            xhr :get, :get_for_geo, geo: 'gibberrrrissssh', use_route: :map_topic
          end
          result = ::JSON.parse(response.body)
          result['geo_key']['city_lower'].should == "berlin"
        end
      end
    end



  end
end

