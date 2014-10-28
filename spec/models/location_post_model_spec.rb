require 'spec_helper'
require './plugins//discourse-plugin-maptopic/spec/map_topic_spec_helper'
require './plugins/discourse-plugin-maptopic/spec/vcr_setup'
# require File.dirname(__FILE__) + '/../spec_helper'

describe 'LocationPost' do
  let(:topic) { create_topic(title: "Any old topic") }
  let!(:post) { create_post(topic: topic, raw: "Pick one.\n\n[poll]\n* Chitoge\n* Onodera\n[/poll]") }

  let(:location) { create_brum_location() }
  # it 'does not geocode when city and country are both present' do
  #   pending "to consider"
  #   pending "to test - country_code after migrating"
  # end
  context 'create_from_location' do
    # let(:location_post) {MapTopic::LocationPost.create_from_location location, post.id  }
    before do
      result = MapTopic::LocationPost.create_from_location location, post
    end

    it 'will assign location to post' do
      post.location.should == location
    end

    it 'will add location to array of locations for post topic ' do
      post.topic.location.should == location
    end

  end

end
