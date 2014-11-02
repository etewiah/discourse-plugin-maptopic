# name: Map-Topic
# about: GigSounder's Map-Topic plugin for Discourse
# version: 0.1
# authors: Ed Tewiah

# load the engine
load File.expand_path('../lib/map_topic/engine.rb', __FILE__)
gem 'geocoder', '1.2.4'
if Rails.env == "development" || Rails.env == "test"
  gem 'vcr', '2.9.3'
end
# it seems declaring a gem here works because of something specific to discourse:
# https://meta.discourse.org/t/specify-external-gem-dependencies-for-plugins/16430
# does not work if a gem version is not specified and below does not work either:
# group :development, :test do
#   gem 'vcr'
# end

register_asset "javascripts/discourse/templates/connectors/topic-title/map-for-topic.js.handlebars"
register_asset "javascripts/discourse/templates/connectors/composer-open/composer-location-selection.js.handlebars"
# register_asset "javascripts/discourse/templates/composer.js.handlebars"
register_asset "javascripts/discourse/templates/modal/places_explorer.js.handlebars"
register_asset "javascripts/discourse/templates/modal/place_details.js.handlebars"
register_asset "javascripts/discourse/templates/modal/add_city.js.handlebars"
register_asset "javascripts/discourse/templates/modal/new_topic.js.handlebars"
register_asset "javascripts/discourse/templates/modal/select_location.js.handlebars"
register_asset "javascripts/discourse/templates/components/selectable-map.js.handlebars"
register_asset "javascripts/discourse/templates/components/topics-map.js.handlebars"
register_asset "javascripts/discourse/templates/components/simple-dropdown.js.handlebars"
register_asset "javascripts/discourse/components/simple-dropdown.js"
register_asset "javascripts/discourse/components/topics-map.js"
register_asset "javascripts/discourse/components/selectable-map.js"
register_asset "javascripts/discourse_extensions/composer_controller.js"
register_asset "javascripts/discourse_extensions/composer_model.js"
register_asset "javascripts/discourse_extensions/topic_list_model.js"
register_asset "javascripts/discourse_extensions/topic_model.js"
register_asset "javascripts/discourse_extensions/topic_controller.js"
register_asset "javascripts/discourse_extensions/application_route.js"
register_asset "javascripts/discourse_extensions/discovery_route.js"
register_asset "javascripts/select_location_modal_controller.js"
register_asset "javascripts/select_location_modal_view.js"
register_asset "javascripts/modals/add_city_modal_controller.js"
register_asset "javascripts/modals/add_city_modal_view.js"
register_asset "javascripts/modals/new_topic_modal_controller.js"
register_asset "javascripts/modals/new_topic_modal_view.js"
register_asset "javascripts/modals/place_details_modal_controller.js"
register_asset "javascripts/modals/place_details_modal_view.js"
register_asset "javascripts/modals/places_explorer_modal_controller.js"
register_asset "javascripts/modals/places_explorer_modal_view.js"
register_asset "javascripts/location_model.js"

register_asset "javascripts/map_controllers.js"
register_asset "javascripts/map_views.js"
register_asset "javascripts/map_routes.js"
register_asset "javascripts/discourse/templates/map_landing.js.handlebars"
register_asset "javascripts/discourse/templates/map_with_sidebox_desktop.js.handlebars"
register_asset "javascripts/discourse/templates/map_with_sidebox_mobile.js.handlebars"
# register_asset "javascripts/discourse/templates/map_full_page.js.handlebars"

register_asset "javascripts/manage_controllers.js"
register_asset "javascripts/manage_views.js"
register_asset "javascripts/manage_routes.js"
register_asset "javascripts/discourse/templates/manage_user_geo_keys.js.handlebars"

register_asset "stylesheets/desktop/maptopic.scss", :desktop
register_asset "stylesheets/mobile/maptopic.scss", :mobile
register_asset "stylesheets/simple-dropdown.scss"
register_asset "stylesheets/common.scss"

# And mount the engine
Discourse::Application.routes.append do
    mount MapTopic::Engine, at: '/'
end

after_initialize do
  require_dependency File.expand_path('../integrate_location_topic.rb', __FILE__)
  load File.expand_path("../app/jobs/map_topic/update_categories.rb", __FILE__)
  load File.expand_path("../app/jobs/map_topic/corrections.rb", __FILE__)

end
