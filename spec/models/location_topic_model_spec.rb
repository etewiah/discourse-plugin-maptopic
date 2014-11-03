require 'spec_helper'
require './plugins//discourse-plugin-maptopic/spec/map_topic_spec_helper'
require './plugins/discourse-plugin-maptopic/spec/vcr_setup'
# require File.dirname(__FILE__) + '/../spec_helper'

describe 'LocationTopic' do
  let(:topic) { create_topic(title: "Any old topic") }
  let(:location) { create_brum_location() }
  # it 'does not geocode when city and country are both present' do
  #   pending "to consider"
  #   pending "to test - country_code after migrating"
  # end
  it 'can be created from a location and topic id ' do
    result = MapTopic::LocationTopic.create_from_location location, topic.id
    # binding.pry

    topic.location.should == location
  end
  # it 'can be created from a country' do
  #   VCR.use_cassette 'geocoded_zambia' do
  #     result = MapTopic::GeoKey.create_from_geo_name 'zambia', 'searched'
  #     result.bounds_value.should == "zambia"
  #     result.country_lower.should == "zambia"
  #   end
  # end

end
