require 'spec_helper'
require './plugins//discourse-plugin-maptopic/spec/map_topic_spec_helper'
# require File.dirname(__FILE__) + '/../spec_helper'

describe 'TopicGeo' do
  let(:geo_key) { MapTopic::GeoKey.create_from_geo 'birmingham', "searched" }

  it 'can be created from a geo_key' do
    result = MapTopic::TopicGeo.create_from_geo_key geo_key, 'question'
    result.bounds_value.should == "birmingham"
    result.country_lower.should == "united kingdom"
    result.capability.should == "question"
  end
end
