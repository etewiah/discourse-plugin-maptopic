module MapTopic
  class GeoTopicsController < ApplicationController
    include CurrentUser

    def get_for_city

      if params[:city]
        city = params[:city].downcase
      else
        # TODO - log how often this is being called - pretty expensive as should be called as little as possible
        geo_key = get_nearest_location_to_request
        city = geo_key.city_lower
      end

      @geo_topics = MapTopic::TopicGeo.where(:city_lower => city)
      if @geo_topics.length < 1
        # when a random city has been passed in, lets create a key for it
        ensure_geo_key_exists city
      end

      # return render json: @geo_topics, each_serializer: MapTopic::GeoTopicSummarySerializer
      serialized_geo_topics = serialize_data(@geo_topics, MapTopic::GeoTopicSummarySerializer)
      return render_json_dump({
        "geo_topics" => serialized_geo_topics,
        "city" => city
        })

      # 2 calls below are the same:
      # render_json_dump(serialize_data(@geo_topics, MapTopic::GeoTopicSummarySerializer))
      # render_serialized(@geo_topics, MapTopic::GeoTopicSummarySerializer)

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
        return MapTopic::GeoKey.near(center_point,5000).first
      else
        return MapTopic::GeoKey.where(:city_lower => 'berlin').first
      end


    end


    def ensure_geo_key_exists(city_name)
      geo_key= MapTopic::GeoKey.where(:city_lower => city_name.downcase).first
      unless geo_key
        location_coordinates = Geocoder.coordinates(city_name)
        if location_coordinates
binding.pry
          geo_key = MapTopic::GeoKey.create({
                bounds_range: 20,
                bounds_type: "city",
                bounds_value: city_name.downcase,
                city_lower: city_name.downcase,
                country_lower: "",
                show_criteria: "searched",
                longitude: location_coordinates[1],
                latitude: location_coordinates[0],
                location_id: 0,
                topic_id: 0
          })
          # return geo_key
        end
      end
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
