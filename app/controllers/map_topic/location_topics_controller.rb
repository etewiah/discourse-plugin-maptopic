module MapTopic
  class LocationTopicsController < ApplicationController
    include CurrentUser

    before_action :check_user, only: [:set_location]

    # end point for routes that are only implemented client side
    # TODO - render useful serverside content for search engine etc..
    def landing
      render json: { status: 'ok'}
    end

    def get_location
      return render json: request.location
    end

    def get_nl
      render json: get_nearest_location_to_request
    end

    def get_for_city
      distance = 20
      # if params[:longitude] && params[:latitude]
      #   longitude = params[:longitude]
      #   latitude = params[:latitude]
      #   center_point = [latitude,longitude]
      if params[:city]
        location = get_location_from_city_name(params[:city])
      else
        location = get_nearest_location_to_request
      end
      center_point = [location.latitude,location.longitude]

      #       if params[:filter_key] && params[:filter_value]
      #   if params[:filter_key] == 'city'
      #     @location_topic_ids = ::MapTopic::GigTopic.where("gig_city = ?", params[:filter_value]).limit(50).pluck('topic_id')
      #   else
      #     return render json: false
      #   end
      # else
      #   @location_topic_ids = MapTopic::GigTopic.limit(50).pluck('topic_id')
      # end

      # [40.4167754, -3.7037902]
      # longitude: "-3.7037902",
      # latitude: "40.4167754",

      box = Geocoder::Calculations.bounding_box(center_point, distance)
      @location_topic_ids = MapTopic::LocationTopic.within_bounding_box(box).limit(50).pluck('topic_id')
      # using bounding_box only because pluck does not seem to work with near:
      # MapTopic::LocationTopic.near('berlin').limit(50).pluck('topic_id')

      list = TopicList.new(:blaa, current_user, location_topics_query)
      # dynamically adding an extra attribute - could get me into trouble as serializer now expects this..
      list.class.module_eval { attr_accessor :city_info}
      list.city_info = location.to_json
      render_serialized(list, MapTopic::LocationTopicListSerializer,  root: 'topic_list')

      # render list
      # json: { status: 'ok'}
    end

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
      location = MapTopic::Location.where(:longitude => longitude, :latitude => latitude).first_or_create
      location.title = params[:location][:title] || ""
      location.address = params[:location][:formattedAddress] || ""

      # below will not update if already exists:
      # do |loc|
      #   loc.title = params[:location_title] || "ll"
      # end
      location.save!


      location_topic = MapTopic::LocationTopic.where(:topic_id => @topic.id).first_or_create
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
      if request.location && request.location.data['longitude'] != "0"
        #         longitude = params[:longitude]
        # latitude = params[:latitude]
        # center_point = ["52.519171","13.4060912"]
        center_point = [request.location.data['latitude'],request.location.data['longitude']]
        return MapTopic::LocationTopic.where(:location_id => 0).near(center_point,5000).first
      else
        return MapTopic::LocationTopic.where(:location_title =>'berlin',:location_id => 0).first
      end
    end


    def get_location_from_city_name(city_name)
      location_topic = MapTopic::LocationTopic.where(:location_title => city_name,:location_id => 0).first
      if location_topic
        return location_topic
      else
        location_coordinates = Geocoder.coordinates(city_name)
        if location_coordinates
          location_topic = MapTopic::LocationTopic.create({
                                                            location_title: city_name,
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
