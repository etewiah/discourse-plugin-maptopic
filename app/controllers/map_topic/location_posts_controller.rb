module MapTopic
  class LocationPostsController < ApplicationController
    include CurrentUser

    before_action :check_user, only: [:set_location, :set_geo]


    def set_geo
      unless(params[:post_id] && params[:geo] )
        render_error "incorrect params"
        return
      end
      # longitude = params[:geo][:longitude]
      # latitude = params[:geo][:latitude]


      @post = Post.find(params[:post_id])
      if current_user.guardian.ensure_can_edit!(@post)
        render status: :forbidden, json: false
        return
      end

      # might use below in the future if I decide to support initial locations ..
      # if params[:initial_location]
      #   create_location params[:initial_location]
      # end


      topic_geo = MapTopic::TopicGeo.where(:topic_id => @post.topic.id).first_or_create

      geo_key = MapTopic::GeoKey.where(:bounds_value => params[:geo][:bounds_value].downcase).first
      unless geo_key
        # todo - create a geo_key if does not exist..
        create_geo_key params[:geo]
      end

      if geo_key
        topic_geo.bounds_value = geo_key.bounds_value
        topic_geo.bounds_type = geo_key.bounds_type
        topic_geo.bounds_range = geo_key.bounds_range
        topic_geo.latitude = geo_key.latitude
        topic_geo.longitude = geo_key.longitude
        topic_geo.city_lower = geo_key.city_lower
        topic_geo.country_lower = geo_key.country_lower
        topic_geo.display_name = geo_key.display_name
        topic_geo.capability = params[:geo][:capability]
      else
        # binding.pry
      end
      # todo - add category when setting geo
      topic_geo.save!

      ensure_category topic_geo.country_lower, topic_geo.city_lower, @post.topic, topic_geo.capability

      return render json: topic_geo.as_json
      # location.to_json

    end


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

      # TODO - use create_location private method...
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
      # todo - ensure there is a location_post for each location topic
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

        topic = @post.topic
        ensure_category location.country, location.city, topic

      end

      return render json: location.to_json

      # render json: @post
    end

    private

    def create_location location
      # TODO - find location which is close enough to be considered the same..
      location = MapTopic::Location.where(:longitude => location[:longitude], :latitude => location[:latitude]).first_or_initialize
      location.title = location[:title] || ""
      location.city = location[:city] || ""
      location.country = location[:country] || ""
      location.address = location[:address] || ""
      location.gplace_id = location[:gplace_id] || ""

      # below will not update if already exists:
      # do |loc|
      #   loc.title = params[:location_title] || "ll"
      # end
      location.save!

    end

    def ensure_category country, city, topic, capability
      admin_user = User.where(:admin => true).last
      question_color = '0E76BD' # darker blue
      # 'F7941D' # orange
      # question_color = '92278F' # purple
      countries_color = '8C6238' #brown
      # gigs_color = 'EA1D25' #red

      country_cat = Category.where(:name => country.titleize).first_or_initialize
      unless country_cat.user
        country_cat.user_id = admin_user.id
        country_cat.color = countries_color
        country_cat.save!
        # below is the 'about category topic':
        country_cat_topic = country_cat.topic
        country_cat_topic.visible = false
        country_cat_topic.save!

      end
      # create(:name => 'China', :color => '8C6238', :user_id => admin_user.id)


      # topic.category = city_cat

      if capability && capability == "question"
        capability_cat_name = city.titleize + " - Question"
        capability_cat = Category.where(:name => capability_cat_name, :parent_category_id => country_cat.id).first_or_initialize
        unless capability_cat.user
          capability_cat.user_id = admin_user.id
          capability_cat.color = question_color
          capability_cat.save!
          capability_cat_topic = capability_cat.topic
          capability_cat_topic.visible = false
          capability_cat_topic.save!
        end
        topic.category = capability_cat
      else

        # TODO - handle scenarios where there might not be a city
        city_cat = Category.where(:name => city.titleize, :parent_category_id => country_cat.id).first_or_initialize
        unless city_cat.user
          city_cat.user_id = admin_user.id
          city_cat.save!
          city_cat_topic = city_cat.topic
          city_cat_topic.visible = false
          city_cat_topic.save!
        end
        topic.category = city_cat
      end
      topic.save!


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
