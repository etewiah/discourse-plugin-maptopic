module MapTopic
  class LocationTopicsController < ApplicationController
    include CurrentUser

    before_action :check_user, only: [:set_location]

    # end point for routes that are only implemented client side
    # TODO - render useful serverside content for search engine etc..
    def landing
      render json: { status: 'ok'}
    end

    def get_req_location
      return render json: request.location
    end

    def get_geocoder_location
      return render json: Geocoder.search(request.remote_ip).first
    end


    def get_remote_ip
      return render json: { remote_ip: request.remote_ip, x_real_ip_env: request.env['HTTP_X_REAL_IP'] }
    end

    def get_remote_addr
      return render json: { remote_addr: request.remote_addr, x_real_ip_hd: request.headers["X-Real-IP"] }
    end

    def get_nl
      render json: get_nearest_location_to_request
    end

    # def get_for_city
    #   distance = 20
    #   # if params[:longitude] && params[:latitude]
    #   #   longitude = params[:longitude]
    #   #   latitude = params[:latitude]
    #   #   center_point = [latitude,longitude]
    #   if params[:city]
    #     location = get_location_from_city_name(params[:city].downcase)
    #   else
    #     # TODO - log how often this is being called - pretty expensive as should be called as little as possible
    #     location = get_nearest_location_to_request
    #   end
    #   center_point = [location.latitude,location.longitude]

    #   box = Geocoder::Calculations.bounding_box(center_point, distance)
    #   @location_topic_ids = MapTopic::LocationTopic.within_bounding_box(box).limit(50).pluck('topic_id')
    #   # using bounding_box only because pluck does not seem to work with near:
    #   # MapTopic::LocationTopic.near('berlin').limit(50).pluck('topic_id')

    #   list = TopicList.new(:blaa, current_user, location_topics_query)
    #   # dynamically adding an extra attribute - could get me into trouble as serializer now expects this..
    #   list.class.module_eval { attr_accessor :city_info}
    #   list.city_info = location.to_json
    #   render_serialized(list, MapTopic::LocationTopicListSerializer,  root: 'topic_list')

    #   # render list
    #   # json: { status: 'ok'}
    # end


# used for setting location on topic when no post is being created
    def set_location
      unless(params[:topic_id] && params[:location] )
        render_error "incorrect params"
        return
      end
      longitude = params[:location][:longitude]
      latitude = params[:location][:latitude]


      @topic = Topic.find(params[:topic_id])
      if current_user.guardian.ensure_can_edit!(@topic)
        render status: :forbidden, json: false
        return
      end


      # TODO - find location which is close enough to be considered the same..
      location = MapTopic::Location.where(:longitude => longitude, :latitude => latitude).first_or_initialize
      location.title = params[:location][:title] || ""
      location.city = params[:location][:city] || ""
      location.country = params[:location][:country] || ""
      location.address = params[:location][:formattedAddress] || ""

      # below will not update if already exists:
      # do |loc|
      #   loc.title = params[:location_title] || "ll"
      # end
      location.save!


      # location_topic = MapTopic::LocationTopic.where(:topic_id => @topic.id).first_or_initialize
      location_topic = MapTopic::LocationTopic.new()
      location_topic.topic_id = @topic.id
      location_topic.city = location.city.downcase
      location_topic.country = location.country.downcase

      location_topic.location_title = location.title
      location_topic.longitude = location.longitude
      location_topic.latitude = location.latitude
      location_topic.location_id = location.id

      location_topic.save!

      return render json: location.to_json

      # render json: @topic
    end

    private

    def get_nearest_location_to_request
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
