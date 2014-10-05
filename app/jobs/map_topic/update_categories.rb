# run “MapTopic::Jobs.set_category_for_location_topics" from console
module MapTopic
  class Jobs
  # include Sidekiq::Worker

  require 'pry'


  # only need to run this once to ensure previously created topics with locations
  # have the right category
        def self.set_category_for_location_topics
            # MapTopic::LocationTopic.all.each{ |l| p l.location_title}
            MapTopic::LocationTopic.all.each do |location_topic|
                if location_topic.topic && location_topic.location
                  topic = location_topic.topic
                  if location_topic.country.empty? || location_topic.city.empty?
                    binding.pry
                  end
                  country = location_topic.country.empty? ? "Unknown" : location_topic.country
                  # city = location_topic.city || "Unknown"
                  city = location_topic.city.empty? ? "Unknown" : location_topic.city
                  ensure_category country, city, topic
                end
            end
        end


    def self.ensure_category country, city, topic
      admin_user = User.where(:admin => true).last
      # cities_color = '92278F' # purple
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



      city_cat = Category.where(:name => city.titleize, :parent_category_id => country_cat.id).first_or_initialize
      unless city_cat.user
        city_cat.user_id = admin_user.id
        city_cat.save!
        city_cat_topic = city_cat.topic
        city_cat_topic.visible = false
        city_cat_topic.save!
      end

      topic.category = city_cat
      topic.save!


    end



  end
end
