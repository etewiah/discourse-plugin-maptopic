module MapTopic
  class LocationPostsController < ApplicationController
    include CurrentUser

    before_action :check_user, only: [:set_location]


    def set_location
      unless(params[:post_id] && params[:location] )
        render_error "incorrect params"
        return
      end
      longitude = params[:location][:longitude]
      latitude = params[:location][:latitude]


      @post = Post.find(params[:post_id])
      if current_user.guardian.ensure_can_edit!(@post)
        render status: :forbidden, json: false
        return
      end


      # TODO - find location which is close enough to be considered the same..
      location = MapTopic::Location.where(:longitude => longitude, :latitude => latitude).first_or_initialize
      location.title = params[:location][:title] || ""
      location.city = params[:location][:city] || ""
      location.country = params[:location][:country] || ""
      location.address = params[:location][:address] || ""
      location.gplace_id = params[:location][:gplace_id] || ""

      # below will not update if already exists:
      # do |loc|
      #   loc.title = params[:location_title] || "ll"
      # end
      location.save!


      location_post = MapTopic::LocationPost.where(:post_id => @post.id).first_or_initialize
      location_post.location_title = location.title
      location_post.longitude = location.longitude
      location_post.latitude = location.latitude
      location_post.location_id = location.id

      location_post.save!

      if @post.post_number == 1
        # this is the post associated with the topic so its location should also 
        # be associated with the topic
        location_topic = MapTopic::LocationTopic.where(:topic_id => @post.topic_id).first_or_initialize
        location_topic.city = location.city.downcase
        location_topic.country = location.country.downcase

        location_topic.location_title = location.title
        location_topic.longitude = location.longitude
        location_topic.latitude = location.latitude
        location_topic.location_id = location.id

        location_topic.save!

      end

      return render json: location.to_json

      # render json: @post
    end

    private

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
