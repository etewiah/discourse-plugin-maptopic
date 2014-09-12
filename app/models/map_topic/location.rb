module MapTopic
    class Location < ActiveRecord::Base
        self.table_name = "locations"

        has_many :location_topics
        # , class_name: "::Blog::GigTopic"
        has_many :topics, through: :location_topics

        #     t.string :title
        # t.text :description
        # t.text :address
        # t.string :city
        # t.string :region
        # t.string :postal_code
        # t.string :country
        # t.float :longitude
        # t.float :latitude
        # t.integer :topics_count


        # has_and_belongs_to_many :topic, :class_name => "Topic"

        # def self.cloud_for_topic(topic_id)
        #   tags = $redis.get("tag_cloud_for_topic_#{topic_id}")

        #   return Marshal.load(tags) unless tags.nil?

        #   tags = Tagger::Tag.select("tagger_tags.title, COUNT(tagger_tags_topics.topic_id) as count")
        #                .group("tagger_tags.id")
        #                .joins(:topic)
        #                .where("tagger_tags_topics.topic_id IN (SELECT tagger_tags_topics.topic_id FROM tagger_tags_topics WHERE tagger_tags_topics.tag_id in (SELECT tagger_tags_topics.tag_id FROM tagger_tags_topics WHERE tagger_tags_topics.topic_id = ? )) ", topic_id)
        #   $redis.setex("tag_cloud_for_topic_#{topic_id}", 15.minutes, Marshal.dump(tags))

        #   tags
        # end

    end
end
