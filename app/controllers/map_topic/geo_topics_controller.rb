module MapTopic
  class GeoTopicsController < ApplicationController
    include CurrentUser

    def get_geo_keys
      @geo_keys = MapTopic::GeoKey.all
      render_json_dump( @geo_keys.as_json )

    end

    def get_for_city

      if params[:city]
        # when a random city has been passed in, below ensures a key is created for it
        geo_key =  ensure_geo_key_exists params[:city].downcase
      else
        # TODO - log how often this is being called - pretty expensive as should be called as little as possible
        geo_key = get_nearest_location_to_request
      end

      unless geo_key
        # this is a really ugly attempt to ensure that I always return a geo_key
        # TODO - have a more sensible way of getting the default
        geo_key = MapTopic::GeoKey.where(:city_lower => 'berlin').first
      end
      city = geo_key.city_lower

      # TODO - where params[:city] is passed but is not the city returned in geo_key (maybe default
      # city was returned) , should return a message to client in addition

      # TODO - make sure this query does not return unlisted or private conversations..
      @city_conversations = MapTopic::TopicGeo.where(:city_lower => city)

      @city_conversations = @city_conversations.select do |conv|
        if conv.topic && conv.topic.location
          true
        else
          false
        end
      end

      @other_conversations = MapTopic::TopicGeo.where("city_lower <> ?", city).limit(6)

      # if @city_conversations.length < 1
      #   # when a random city has been passed in, lets create a key for it
      #   ensure_geo_key_exists city
      # end

      # return render json: @city_conversations, each_serializer: MapTopic::GeoTopicSummarySerializer
      city_conversations_serialized = serialize_data(@city_conversations, MapTopic::GeoTopicSummarySerializer)
      other_conversations_serialized = serialize_data(@other_conversations, MapTopic::GeoTopicSummarySerializer)

      return render_json_dump({
                                "geo_key" => geo_key,
                                "other_conversations" => other_conversations_serialized,
                                "city_conversations" => city_conversations_serialized,
                                "city" => city
      })

      # 2 calls below are the same:
      # render_json_dump(serialize_data(@city_conversations, MapTopic::GeoTopicSummarySerializer))
      # render_serialized(@city_conversations, MapTopic::GeoTopicSummarySerializer)

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


    def ensure_geo_key_exists(city_name)
      geo_key= MapTopic::GeoKey.where(:city_lower => city_name.downcase).first
      unless geo_key
        geo_key = MapTopic::GeoKey.create_from_city  city_name.downcase

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
