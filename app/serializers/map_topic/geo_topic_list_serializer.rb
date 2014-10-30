# module MapTopic
#   class GeoTopicListSerializer < ApplicationSerializer

#     attributes :can_create_topic,
#                :more_topics_url,
#                :draft,
#                :draft_key,
#                :draft_sequence,
#                :location_topics,
#                :locations
#                # :city_info

#     has_many :topics, serializer: TopicListItemSerializer, embed: :objects

#     def can_create_topic
#       scope.can_create?(Topic)
#     end

#     def include_more_topics_url?
#       object.more_topics_url.present? && (object.topics.size == SiteSetting.topics_per_page)
#     end

#     def location_topics
#       MapTopic::LocationTopic.where(:topic_id => object.topic_ids)
#       # .where('location_id > 0')
#     end

#     def locations
#       location_ids = MapTopic::LocationTopic.where(:topic_id => object.topic_ids).pluck('location_id')
#       MapTopic::Location.find(location_ids)
#       # .where('location_id > 0')
#     end

#   end

# end
