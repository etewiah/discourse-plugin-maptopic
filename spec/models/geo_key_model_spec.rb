require 'spec_helper'
require './plugins//discourse-plugin-maptopic/spec/map_topic_spec_helper'
require './plugins/discourse-plugin-maptopic/spec/vcr_setup'
# require File.dirname(__FILE__) + '/../spec_helper'

describe 'GeoKey' do
  it 'does not geocode when city and country are both present' do
    pending "to consider"
    pending "to test - country_code after migrating"
  end
  it 'can be created from a city' do
    result = MapTopic::GeoKey.create_from_geo_name 'birmingham', 'searched'
    result.bounds_value.should == "birmingham"
    result.country_lower.should == "united kingdom"
    result.show_criteria.should == "searched"
  end
  it 'can be created from a country' do
    VCR.use_cassette 'geocoded_zambia' do
      result = MapTopic::GeoKey.create_from_geo_name 'zambia', 'searched'
      result.bounds_value.should == "zambia"
      result.country_lower.should == "zambia"
    end
  end

end
