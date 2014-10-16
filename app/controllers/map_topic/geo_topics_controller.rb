module MapTopic
  class GeoTopicsController < ApplicationController
    include CurrentUser

    def get_for_city

      @geo_topics = MapTopic::TopicGeo.where(:city_lower => params[:city].downcase)
       # MapTopic::TopicGeo.all.count

      return render json: @geo_topics, each_serializer: MapTopic::GeoTopicSummarySerializer

      # return render json: @geo_topics.as_json
      # json: { status: 'ok'}
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

      unless request_location && request_location.data['longitude'] != "0"
        # where I can't find a location for that ip or it returns a location with no longitude
        # default to Berlin...
        return MapTopic::LocationTopic.where(:location_title =>'berlin',:location_id => 0).first

      else
        center_point = [request_location.data['latitude'],request_location.data['longitude']]
        return MapTopic::LocationTopic.where(:location_id => 0).near(center_point,5000).first
    
      end


    end


    def get_location_from_city_name(city_name)
      location_topic = MapTopic::LocationTopic.where(:location_title => city_name.downcase,:location_id => 0).first
      if location_topic
        return location_topic
      else
        location_coordinates = Geocoder.coordinates(city_name)
        if location_coordinates
          location_topic = MapTopic::LocationTopic.create({
                                                            location_title: city_name.downcase,
                                                            longitude: location_coordinates[1],
                                                            latitude: location_coordinates[0],
                                                            location_id: 0,
                                                            topic_id: 0
          })
          return location_topic
        else
          return MapTopic::LocationTopic.where(:location_title =>'london',:location_id => 0).first
        end
      end
    end

    def location_topics_query(options={})
      Topic.where("deleted_at" => nil)
      .where("visible")
      .where("archetype <> ?", Archetype.private_message)
      .where(id: @location_topic_ids)
    end

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
