# name: Map-Topic
# about: GigSounder's Map-Topic plugin for Discourse
# version: 0.1
# authors: Ed Tewiah

# load the engine
load File.expand_path('../lib/map_topic/engine.rb', __FILE__)


register_asset "javascripts/discourse/templates/composer.js.handlebars"
register_asset "javascripts/discourse/templates/modal/select_location.js.handlebars"
register_asset "javascripts/discourse/templates/components/selectable-map.js.handlebars"
register_asset "javascripts/discourse/components/selectable-map.js"
register_asset "javascripts/discourse_extensions/composer_controller.js"
register_asset "javascripts/discourse_extensions/composer_model.js"
register_asset "javascripts/discourse_extensions/application_route.js"
register_asset "javascripts/select_location_modal_controller.js"
register_asset "javascripts/select_location_modal_view.js"

register_asset "javascripts/map_controllers.js"
register_asset "javascripts/map_views.js"
register_asset "javascripts/map_routes.js"
register_asset "javascripts/discourse/templates/map.js.handlebars"
register_asset "javascripts/discourse/templates/map_from_one_param.js.handlebars"


register_asset "stylesheets/desktop/maptopic.scss", :desktop

# And mount the engine
Discourse::Application.routes.append do
    mount MapTopic::Engine, at: '/'
end
