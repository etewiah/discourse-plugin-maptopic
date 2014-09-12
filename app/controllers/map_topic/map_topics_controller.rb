module MapTopic
  class MapTopicsController < ApplicationController
    include CurrentUser

    before_action :check_user, only: [:set_tags]

    # GET /tags
    def index
      render json: { status: 'ok'}
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
