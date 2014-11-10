module MapTopic
  class LocationsController < ApplicationController
    include CurrentUser
    before_action :check_user, only: [:update_geo_places]


    def get_for_geo
      # if params[:geo]
      #   # when a random geo has been passed in, below ensures a key is created for it
      #   geo_key =  ensure_geo_key_exists params[:geo].downcase
      # else
      #   # TODO - log how often this is being called - pretty expensive as should be called as little as possible
      #   geo_key = get_nearest_location_to_request
      # end

      # unless geo_key
      #   # this is a really ugly attempt to ensure that I always return a geo_key
      #   # TODO - have a more sensible way of getting the default
      #   geo_key = MapTopic::GeoKey.where(:bounds_value => 'berlin').first
      # end
      # geo = geo_key.bounds_value

      locations = MapTopic::Location.all

      return render_json_dump (locations.as_json)

      # TODO - where params[:geo] is passed but is not the geo returned in geo_key (maybe default
      # geo was returned) , should return a message to client in addition

      # @geo_topic_ids = MapTopic::TopicGeo.where(:bounds_value => geo).limit(10).pluck('topic_id')

      # geo_topics =  Topic.where("deleted_at" => nil)
      # .where("visible")
      # .where("archetype <> ?", Archetype.private_message)
      # .where(id: @geo_topic_ids)

      # # TODO - use hotness or other criteria below:
      # @other_topic_ids = MapTopic::TopicGeo.where("bounds_value <> ?", geo).limit(10).pluck('topic_id')
      # other_topics =  Topic.where("deleted_at" => nil)
      # .where("visible")
      # .where("archetype <> ?", Archetype.private_message)
      # .where(id: @other_topic_ids)


      # # geo_topic_list = TopicList.new(:blaa, current_user, location_topics_query)
      # # dynamically adding an extra attribute - could get me into trouble as serializer now expects this..
      # # geo_topic_list.class.module_eval { attr_accessor :city_info}
      # # geo_topic_list.city_info = location.to_json
      # geo_topic_list_serialized = serialize_data(geo_topics, MapTopic::GeoTopicItemSerializer)
      # other_topic_list_serialized = serialize_data(other_topics, MapTopic::GeoTopicItemSerializer)

      # # render_serialized(geo_topic_list, MapTopic::LocationTopicListSerializer,  root: 'geo_topic_list')
      # return render_json_dump({
      #                           "geo_topics" => geo_topic_list_serialized,
      #                           "other_topics" => other_topic_list_serialized,
      #                           "geo_key" => geo_key,
      #                           "geo" => geo
      # })

    end


    private

    def get_nearest_location_to_request
      # if request.location && request.location.data['longitude'] != "0"
      #   center_point = [request.location.data['latitude'],request.location.data['longitude']]
      #   return MapTopic::LocationTopic.where(:location_id => 0).near(center_point,5000).first
      # else
      #   return MapTopic::LocationTopic.where(:location_title =>'berlin',:location_id => 0).first
      # end
      request_location = Geocoder.search(request.remote_ip).first

      if request_location && request_location.data['longitude'] != "0"
        center_point = [request_location.data['latitude'],request_location.data['longitude']]
        nearest_location = MapTopic::GeoKey.near(center_point,5000).first
      end
      return nearest_location

    end


    def ensure_geo_key_exists(geo_name)
      geo_key= MapTopic::GeoKey.where(:city_lower => geo_name.downcase).first
      unless geo_key
        geo_key = MapTopic::GeoKey.create_from_geo_name  geo_name.downcase, "searched"
      end
      return geo_key
    end

    # def location_topics_query(options={})
    #   Topic.where("deleted_at" => nil)
    #   .where("visible")
    #   .where("archetype <> ?", Archetype.private_message)
    #   .where(id: @location_topic_ids)
    # end

    def check_user
      if current_user.nil?
        render status: :forbidden, json: false
        return
      end
    end


    def render_error(message)
      render status: :bad_request, json: {"error" => {"message" => message}}
    end

  end
end
