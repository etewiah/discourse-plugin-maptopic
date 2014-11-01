module MapTopic
  class LocationPostsController < ApplicationController
    include CurrentUser

    before_action :check_user, only: [:set_location, :set_geo]

    # called when a new topic is created
    # sets a TopicGeo object on the topic
    # Bases the TopicGeo on GeoKey (at the moment for the city - bounds_value could in
    # theory be a country or region or womex2014... )
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
      if params[:geo][:initial_location]
        # TODO - do something with google place id to enhance location info
        location = create_location params[:geo][:initial_location]
        @post.location = location
        @post.save!
        # binding.pry
      end


      # if relevant geokey does not exist, create it
      geo_key = MapTopic::GeoKey.where(:bounds_value => params[:geo][:bounds_value].downcase).first
      unless geo_key
        # can't really see scenario where would get here as all set_geo will only be called by
        # client after a GeoKey has been created and map built from it client side
        geo_key = MapTopic::GeoKey.create_from_geo  params[:geo][:bounds_value].downcase, "searched"
      end

      topic_geo = MapTopic::TopicGeo.where(:topic_id => @post.topic.id).first
      unless topic_geo
        topic_geo = MapTopic::TopicGeo.create_from_geo_key geo_key, params[:geo][:capability]
        topic_geo.topic_id = @post.topic.id
        topic_geo.save!
      end


      ensure_category @post.topic, topic_geo.capability

      category_serialized = serialize_data(@post.topic.category, ::CategorySerializer, root: false)
      topic_serialized = serialize_data(@post.topic, ::BasicTopicSerializer, root: false)
      # other_conversations_serialized = serialize_data(@other_conversations, MapTopic::GeoTopicSummarySerializer)

      return render_json_dump({
                                "category" => category_serialized,
                                "topic" => topic_serialized,
                                "topic_geo" => topic_geo.as_json
      })

      # return render json: topic_geo.as_json
    end

    # used for setting location on post (and topic) when post is being created
    # assumption here is that set_geo has already been called and category set
    # TODO - handle scenarios where locations are added to a topic that was never created
    # as a geo-topic..  (so check and ensure geo and category are set)
    # or maybe should leave as is ...
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

      # below ensures that location is set for topic too:
      location_post = MapTopic::LocationPost.create_from_location location, @post

      if @post.post_number == 1
        # should not get here - now using set_geo for new topics...
        # binding.pry
        # # this is the post associated with the topic so its location should also
        # # be associated with the topic
        # location_topic = MapTopic::LocationTopic.where(:topic_id => @post.topic_id).first_or_initialize
        # location_topic.city = location.city.downcase
        # location_topic.country = location.country.downcase

        # location_topic.location_title = location.title
        # location_topic.longitude = location.longitude
        # location_topic.latitude = location.latitude
        # location_topic.location_id = location.id

        # location_topic.save!

        # topic = @post.topic
        # ensure_category location.country, location.city, topic, ""

      end

      return render json: location.to_json

      # render json: @post
    end

    private

    # poorly named...
    def create_location location
      # TODO - find location which is close enough to be considered the same..
      location_object = MapTopic::Location.where(:longitude => location[:longitude], :latitude => location[:latitude]).first_or_initialize
      location_object.title = location[:title] || ""
      location_object.city = location[:city] || ""
      location_object.country = location[:country] || ""
      location_object.address = location[:address] || ""
      location_object.gplace_id = location[:gplace_id] || ""
      # below will not update if already exists:
      # do |loc|
      #   loc.title = params[:location_title] || "ll"
      # end
      location_object.save!
      return location_object
    end


    # TODO - reopen topic model and add this there:
    def ensure_category topic, capability
      country = topic.geo.country_lower
      city = topic.geo.city_lower
      admin_user = User.where(:admin => true).last
      question_color = '0E76BD' # darker blue
      # 'F7941D' # orange
      # question_color = '92278F' # purple
      countries_color = '8C6238' #brown
      cities_color = nil
      # gigs_color = 'EA1D25' #red
      # binding.pry
      # assuming bounds_value will never be 'unknown'
      if city == topic.geo.bounds_value
        country_cat = create_geo_category country.titleize, admin_user, countries_color, nil
        # if capability && capability == "question"
        #   capability_cat_name = city.titleize + " - Question"
        # end
        city_cat = create_geo_category city.titleize, admin_user, cities_color, country_cat
        topic.category = city_cat
      else
        region_or_country_cat = create_geo_category topic.geo.bounds_value.titleize, admin_user, countries_color, nil
        topic.category = region_or_country_cat
      end

      topic.save!
      # binding.pry
    end

    def create_geo_category name, admin_user, color, parent
      if parent
        geo_category = Category.where(:name => name, :parent_category_id => parent.id).first_or_initialize
      else
        geo_category = Category.where(:name => name).first_or_initialize
      end
      unless geo_category.user
        geo_category.user_id = admin_user.id
        if color
          geo_category.color = color
        end
        geo_category.save!
        # below is the 'about category topic':
        geo_category_topic = geo_category.topic
        geo_category_topic.visible = false
        geo_category_topic.save!
      end
      return geo_category
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
