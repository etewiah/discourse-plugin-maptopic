module MapTopic
  class GeoTopicsController < ApplicationController
    include CurrentUser
    before_action :check_user, only: [:update_geo_places]


    def remove_geo_place
      unless(params[:topic_id] && params[:location_id])
        render_error "incorrect params"
        return
      end
      # TODO  should have a field on location which I update 


      @topic = Topic.find(params[:topic_id])
      if current_user.guardian.ensure_can_edit!(@topic)
        render status: :forbidden, json: false
        return
      end
      location_id = params[:location_id].to_s

      unless @topic.geo.places[location_id]
        # if the location can't be found, return
        return render_json_dump @topic.geo.as_json
      end

      associated_post_ids = @topic.geo.places[location_id]["post_ids"]
      binding.pry
      associated_post_ids.each do |post_id|
        # @post = Post.find(post_id)
        MapTopic::LocationPost.disassociate location_id, post_id
      end

      @topic.geo.places.delete location_id
      @topic.geo.places['sorted_ids'].delete location_id
      @topic.geo.save!
      return render_json_dump @topic.geo.as_json

    end

# below is only used for updating geo_place - which is independent of the location record to which it is tied
# When I get round to creating a service object for geo_place I will do checks with location record each time
# - geo_places are created when a new location is created in a topic
    def update_geo_places
      unless(params[:place] && params[:topic_id] && params[:location_id])
        render_error "incorrect params"
        return
      end

      @topic = Topic.find(params[:topic_id])
      if current_user.guardian.ensure_can_edit!(@topic)
        render status: :forbidden, json: false
        return
      end

# passing in location_id might be redundant as with updates, place should already have location_id
      location_id = params[:location_id].to_s
      # below is a workaround check while I still have some places in db
      # that are arrays
      # binding.pry
      # if @topic.geo.places.class == Array
      unless (@topic.geo.places.class == Hash) && (@topic.geo.places['sorted_ids'])
        @topic.geo.places = {
          'sorted_ids' => []
        }
        @topic.geo.save
      end

      unless @topic.geo.places['sorted_ids'].include? location_id
        @topic.geo.places['sorted_ids'].push location_id
      end

      place = JSON.parse params[:place]
# place param is now passed as a string ( json.stringyfy client side)
# - allowing jquery to process the payload resulted in nested arrays getting converted to hashes
# http://stackoverflow.com/questions/25856959/parsing-json-with-jquery-turns-array-into-hash
# with json parse above, probably don't need below check anymore
      place['longitude'] = place['longitude'].to_f
      place['latitude'] = place['latitude'].to_f
      place['location_id'] = location_id

      # should do some checks to prevent injection attacks
      @topic.geo.places[location_id] = place
      # topic_places = @topic.geo.places || []

      @topic.geo.save!
      return render_json_dump @topic.geo.as_json

    end

    def get_geo_keys
      @geo_keys = MapTopic::GeoKey.all
      render_json_dump( @geo_keys.as_json )

    end

# I use geo to refer to a string like 'morroco'
# should really have used the word geo_name ..
    def get_geo_key
      unless(params[:geo] )
        render_error "incorrect params"
        return
      end
      geo_key =  ensure_geo_key_exists params[:geo].downcase
      unless geo_key
        render json: {"error" => {"message" => "geo_not_found"}}
        return
      end
      return render json: geo_key.as_json
    end

    def get_for_geo
      if params[:geo]
        # when a random geo has been passed in, below ensures a key is created for it
        geo_key =  ensure_geo_key_exists params[:geo].downcase
      else
        # TODO - log how often this is being called - pretty expensive as should be called as little as possible
        geo_key = get_nearest_location_to_request
      end

      unless geo_key
        # this is a really ugly attempt to ensure that I always return a geo_key
        # TODO - have a more sensible way of getting the default
        geo_key = MapTopic::GeoKey.where(:bounds_value => 'berlin').first
      end
      geo = geo_key.bounds_value
      # TODO - where params[:geo] is passed but is not the geo returned in geo_key (maybe default
      # geo was returned) , should return a message to client in addition

      @geo_topic_ids = MapTopic::TopicGeo.where(:bounds_value => geo).limit(10).pluck('topic_id')

      geo_topics =  Topic.where("deleted_at" => nil)
      .where("visible")
      .where("archetype <> ?", Archetype.private_message)
      .where(id: @geo_topic_ids)

      # TODO - use hotness or other criteria below:
      @other_topic_ids = MapTopic::TopicGeo.where("bounds_value <> ?", geo).limit(10).pluck('topic_id')
      other_topics =  Topic.where("deleted_at" => nil)
      .where("visible")
      .where("archetype <> ?", Archetype.private_message)
      .where(id: @other_topic_ids)


      # geo_topic_list = TopicList.new(:blaa, current_user, location_topics_query)
      # dynamically adding an extra attribute - could get me into trouble as serializer now expects this..
      # geo_topic_list.class.module_eval { attr_accessor :city_info}
      # geo_topic_list.city_info = location.to_json
      geo_topic_list_serialized = serialize_data(geo_topics, MapTopic::GeoTopicItemSerializer)
      other_topic_list_serialized = serialize_data(other_topics, MapTopic::GeoTopicItemSerializer)

      # render_serialized(geo_topic_list, MapTopic::LocationTopicListSerializer,  root: 'geo_topic_list')
      return render_json_dump({
                                "geo_topics" => geo_topic_list_serialized,
                                "other_topics" => other_topic_list_serialized,
                                "geo_key" => geo_key,
                                "geo" => geo
      })
      # need to add geo above as its the key used in ember route


      # @other_conversations = MapTopic::TopicGeo.where("bounds_value <> ?", geo).limit(6)

      # # return render json: @geo_conversations, each_serializer: MapTopic::GeoTopicSummarySerializer
      # geo_conversations_serialized = serialize_data(@geo_conversations, MapTopic::GeoTopicSummarySerializer)
      # other_conversations_serialized = serialize_data(@other_conversations, MapTopic::GeoTopicSummarySerializer)

      # return render_json_dump({
      #                           "geo_key" => geo_key,
      #                           "other_conversations" => other_conversations_serialized,
      #                           "geo_conversations" => geo_conversations_serialized,
      #                           "geo" => geo
      # })

      # 2 calls below are the same:
      # render_json_dump(serialize_data(@city_conversations, MapTopic::GeoTopicSummarySerializer))
      # render_serialized(@city_conversations, MapTopic::GeoTopicSummarySerializer)
    end

    # def get_for_geo_old
    #   if params[:geo]
    #     # when a random geo has been passed in, below ensures a key is created for it
    #     geo_key =  ensure_geo_key_exists params[:geo].downcase
    #   else
    #     # TODO - log how often this is being called - pretty expensive as should be called as little as possible
    #     geo_key = get_nearest_location_to_request
    #   end

    #   unless geo_key
    #     # this is a really ugly attempt to ensure that I always return a geo_key
    #     # TODO - have a more sensible way of getting the default
    #     geo_key = MapTopic::GeoKey.where(:bounds_value => 'berlin').first
    #   end
    #   geo = geo_key.bounds_value
    #   # TODO - where params[:geo] is passed but is not the geo returned in geo_key (maybe default
    #   # geo was returned) , should return a message to client in addition

    #   # TODO - make sure this query does not return unlisted or private conversations..
    #   @geo_conversations = MapTopic::TopicGeo.where(:bounds_value => geo)


    #   # below rejects conversations without a topic or location - should not be necessary
    #   @geo_conversations = @geo_conversations.select do |conv|
    #     if conv.topic
    #       # && conv.topic.location
    #       true
    #     else
    #       # binding.pry
    #       false
    #     end
    #   end

    #   @other_conversations = MapTopic::TopicGeo.where("bounds_value <> ?", geo).limit(6)

    #   # return render json: @geo_conversations, each_serializer: MapTopic::GeoTopicSummarySerializer
    #   geo_conversations_serialized = serialize_data(@geo_conversations, MapTopic::GeoTopicSummarySerializer)
    #   other_conversations_serialized = serialize_data(@other_conversations, MapTopic::GeoTopicSummarySerializer)

    #   return render_json_dump({
    #                             "geo_key" => geo_key,
    #                             "other_conversations" => other_conversations_serialized,
    #                             "geo_conversations" => geo_conversations_serialized,
    #                             "geo" => geo
    #   })

    # end


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
