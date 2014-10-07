# Integrate our plugin with Discourse
# I lose this (ability to say Topic.last.location_topic for example ) when I
# call reload! from the console...
# - also, reloading the console can cause the dev rails server to no longer recognise this...
# https://meta.discourse.org/t/plugin-system-upgrades/16120/14
# add location to the topics
module LocationTopicExtender
  def self.included(klass)
    klass.has_one :location_topic, class_name: "::MapTopic::LocationTopic"
    klass.has_one :location, through: :location_topic, class_name: "::MapTopic::Location"

    # 7 oct 2014: will allow multiple locations per topic - will phase above out once data has been migrated
    klass.has_many :topic_locations, class_name: "::MapTopic::LocationTopic"
    klass.has_many :locations, through: :topic_locations, class_name: "::MapTopic::Location"

    # , autosave: true, class_name: "::Tagger::Tag"
  end
end

Topic.send(:include, LocationTopicExtender)

# add location to the posts
module LocationPostExtender
  def self.included(klass)
    klass.has_one :location_post, class_name: "::MapTopic::LocationPost"
    klass.has_one :location, through: :location_post, class_name: "::MapTopic::Location"

    # 7 oct 2014: will allow multiple locations per post - will phase above out once data has been migrated
    # for now, UI will only allow selection of 1 location per post - this might change in future
    # locationPost has to have a corresponding LocationTopic
    klass.has_many :post_locations, class_name: "::MapTopic::LocationPost"
    klass.has_many :locations, through: :post_locations, class_name: "::MapTopic::Location"


    # , autosave: true, class_name: "::Tagger::Tag"
  end
end
Post.send(:include, LocationPostExtender)

# add the location to the post serializer
module ExtendPostSerializerForLocationTopic
  def self.included(klass)
    klass.attributes :location
    klass.attributes :locations
  end
  #
  def location
    ::MapTopic::LocationDetailedSerializer.new( object.location, root: false )
  end
  def locations
    return @locations if @locations.present?
    @locations = []
    if object.locations
      object.locations.each_with_index do |l, idx|
        location = ::MapTopic::LocationDetailedSerializer.new(l, root: false)
        @locations << location.as_json
      end
    end
    @locations
  end

end

PostSerializer.send(:include, ExtendPostSerializerForLocationTopic)



# add the location to the topic view serializer
module ExtendTopicViewSerializerForLocationTopic
  def self.included(klass)
    klass.attributes :location
    klass.attributes :locations
  end
  #
  def location
    ::MapTopic::LocationDetailedSerializer.new( object.topic.location, root: false )
  end
  # def locations
  #   ::MapTopic::LocationDetailedSerializer.new( object.topic.locations, root: false )
  # end
  def locations
    return @locations if @locations.present?
    @locations = []
    if object.topic.locations
      object.topic.locations.each_with_index do |l, idx|
        location = ::MapTopic::LocationDetailedSerializer.new(l, root: false)
        @locations << location.as_json
      end
    end
    @locations
  end
  # above based on how post_stream_serializer_mixin handles posts (below):
  # def posts
  #   return @posts if @posts.present?
  #   @posts = []
  #   highest_number_in_posts = 0
  #   if object.posts
  #     object.posts.each_with_index do |p, idx|
  #       highest_number_in_posts = p.post_number if p.post_number > highest_number_in_posts
  #       ps = PostSerializer.new(p, scope: scope, root: false)
  #       ps.topic_slug = object.topic.slug
  #       ps.topic_view = object
  #       p.topic = object.topic

  #       @posts << ps.as_json
  #     end
  #   end
  #   @posts
  # end



end

TopicViewSerializer.send(:include, ExtendTopicViewSerializerForLocationTopic)
