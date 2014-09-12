module MapTopic
  class MapTopicsController < ApplicationController
    include CurrentUser

    before_action :check_user, only: [:set_location]

    # GET /tags
    def index
      render json: { status: 'ok'}
    end

    def set_location
      unless(params[:topic_id] && params[:longitude] )
        render_error "incorrect params"
        return
      end

      @topic = Topic.find(params[:topic_id])
      if current_user.guardian.ensure_can_edit!(@topic)
        render status: :forbidden, json: false
        return
      end


      # TODO - find location which is close enough to be considered the same..
      location = MapTopic::Location.where(:longitude => params[:longitude], :latitude => params[:latitude]).first_or_create
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
    # Use callbacks to share common setup or constraints between actions.
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
