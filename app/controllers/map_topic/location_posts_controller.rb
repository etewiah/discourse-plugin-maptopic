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

      # if relevant geokey does not exist, create it
      geo_key = MapTopic::GeoKey.where(:bounds_value => params[:geo][:bounds_value].downcase).first
      unless geo_key
        # can't really see scenario where would get here as all set_geo will only be called by
        # client after a GeoKey has been created and map built from it client side
        geo_key = MapTopic::GeoKey.create_from_geo_name  params[:geo][:bounds_value].downcase, "searched"
      end

      topic_geo = MapTopic::TopicGeo.where(:topic_id => @post.topic.id).first
      unless topic_geo
        topic_geo = MapTopic::TopicGeo.create_from_geo_key geo_key, params[:geo][:capability]
        topic_geo.topic_id = @post.topic.id
        topic_geo.save!
      end

      # below needs to run after geo has been created for topic
      if params[:geo][:initial_location]
        # TODO - do something with google place id to enhance location info
        location = MapTopic::Location.create_from_location_hash params[:geo][:initial_location]

        # location = create_location params[:geo][:initial_location]
              # below ensures that location is set for topic too:
        location_post = MapTopic::LocationPost.create_from_location location, @post
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

      location = MapTopic::Location.create_from_location_hash params[:location]

      # below will not update if already exists:
      # do |loc|
      #   loc.title = params[:location_title] || "ll"
      # end
      # location.save!

      # below ensures that location is set for topic too:
      location_post = MapTopic::LocationPost.create_from_location location, @post

      return render json: location.to_json
    end

    private

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
