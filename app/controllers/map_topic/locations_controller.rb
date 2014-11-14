module MapTopic
  class LocationsController < ApplicationController
    include CurrentUser
    # before_action :check_user, only: [:update_geo_places]

    def get_details
      location = MapTopic::Location.find(params[:id])
      return render_json_dump serialize_data(location, MapTopic::LocationDetailedSerializer, root: false)
    end

    def get_for_geo

      locations = MapTopic::Location.all

      return render_json_dump (locations.as_json)
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
