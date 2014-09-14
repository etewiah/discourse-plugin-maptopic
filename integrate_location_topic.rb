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


    # , autosave: true, class_name: "::Tagger::Tag"
  end
end

Topic.send(:include, LocationTopicExtender)

# add location to the posts
module LocationPostExtender
  def self.included(klass)
    klass.has_one :location_post, class_name: "::MapTopic::LocationPost"
    klass.has_one :location, through: :location_post, class_name: "::MapTopic::Location"


    # , autosave: true, class_name: "::Tagger::Tag"
  end
end
Post.send(:include, LocationPostExtender)

# add the location to the post serializer
module ExtendPostSerializerForLocationTopic
  def self.included(klass)
    klass.attributes :location
  end
  #
  def location
    ::MapTopic::LocationDetailedSerializer.new( object.location, root: false )
  end
end

PostSerializer.send(:include, ExtendPostSerializerForLocationTopic)



# add the location to the topic view serializer
module ExtendTopicViewSerializerForLocationTopic
  def self.included(klass)
    klass.attributes :location
  end
  #
  def location
    ::MapTopic::LocationDetailedSerializer.new( object.topic.location, root: false )
  end
end

TopicViewSerializer.send(:include, ExtendTopicViewSerializerForLocationTopic)
