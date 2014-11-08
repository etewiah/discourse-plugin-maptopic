require 'spec_helper'
require './plugins//discourse-plugin-maptopic/spec/map_topic_spec_helper'
# require File.dirname(__FILE__) + '/../spec_helper'

describe 'TopicGeo' do
	let(:geo_key) { MapTopic::GeoKey.create_from_geo_name 'birmingham', "searched" }
	let(:location) { create_brum_location() }

	it 'can be created from a geo_key' do
		topic_geo = MapTopic::TopicGeo.create_from_geo_key geo_key, 'question'
		topic_geo.bounds_value.should == "birmingham"
		topic_geo.country_lower.should == "united kingdom"
		topic_geo.capability.should == "question"
	end

	context 'given a newly created topic_geo' do
		let(:topic_geo) { MapTopic::TopicGeo.create_from_geo_key geo_key, 'question' }

		describe 'when a place is added to it' do
			before do
				topic_geo.add_or_update_place location, nil
			end
			it 'will have correct place json' do
				topic_geo.places[location.id.to_s]['title'].should == location.title
				topic_geo.places[location.id.to_s]['location_id'].should == location.id
			end

			# it_should_behave_like ""
		end

		describe 'when a place is added to it multiple times' do
			before do
				topic_geo.add_or_update_place location, nil
				topic_geo.add_or_update_place location, nil
				topic_geo.add_or_update_place location, nil
			end
			it 'will only save that place once' do
        topic_geo.places['sorted_ids'].count.should == 1
			end
		end
	end

end
