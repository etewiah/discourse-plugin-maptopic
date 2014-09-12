module MapTopic
  class MapTopicsController < ApplicationController
    include CurrentUser

    before_action :check_user, only: [:set_location]

    # GET /tags
    def index
      render json: { status: 'ok'}
    end

    def set_location
      @topic = Topic.find(params[:topic_id])
      if current_user.guardian.ensure_can_edit!(@topic)
        render status: :forbidden, json: false
        return
      end

      render json: @topic
    end

    private
    # Use callbacks to share common setup or constraints between actions.
    def check_user
      if current_user.nil?
        render status: :forbidden, json: false
        return
      end
    end

  end
end
