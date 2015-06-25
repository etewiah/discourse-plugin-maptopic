// import { Button } from "discourse/views/post-menu";

// export default {
//   name: "correct-post",

//   initialize: function (container) {
//     var PostMenuView = container.lookupFactory("view:post-menu");

//     PostMenuView.reopen({
//       shouldRerenderCorrectButton: Discourse.View.renderIfChanged("post.topic.correct_post_id"),

//       buttonForCorrect: function(post) {
//         var correctPostId = post.get("topic.correct_post_id");

//         if (post.get("topic.details.can_edit") && post.get("id") === parseInt(correctPostId, 10)) {
//           return new Button("correct", "incorrect_post", "check-square", { className: 'mark-incorrect' });
//         } else {
//           return new Button("correct", "correct_post", "check-square");
//         }
//       },

//       clickCorrect: function() {
//         this.get('controller').toggleSolved(this.get("post"));
//       }
//     });
//   }
// };

// adding button as per:
// https://meta.discourse.org/t/plugin-tutorial-3-how-to-add-a-button-after-every-posts/11050
// naming is key.  buttonFor... and click... methods have to have the name of this view in it
// also relies on adding the name of this ('postlocation') to the post-menu list in settings...
import {
  Button
}
from "discourse/views/post-menu";

export
default {
  name: "postlocation-button",

  initialize: function(container) {
    var PostMenuView = container.lookupFactory("view:post-menu");

    PostMenuView.reopen({
      shouldRerenderPostlocationButton: Discourse.View.renderIfChanged("post.temporarily_hidden"),
      buttonForPostlocation: function(post, buffer) {
        var locationTitle = this.get('post.location.title');
        if (Ember.isEmpty(locationTitle)) {
          return null;
          // for topic post, the location is associated with the topic not the post
          // might be an idea to change this...
          // if (this.get('post.post_number') === 1 && this.get('post.topic.location.title')) {
          //   locationTitle = this.get('post.topic.location.title');
          // } else {
          //   return null;
          // }

        }
        // buffer.push('<button title="Mark this post as solving your initial question" data-action="correct">Mark as correct</button>');

        // var innerHTML = "<a> Show '" + locationTitle + "'</a>";
        var innerHTML = "<span> &nbsp; &nbsp;" + locationTitle + "</span>";
        var opts = {
          innerHTML: innerHTML,
          className: "place-in-post ptr"
        }
        return new Button("postlocation", "go_to_location", "map-marker", opts);

      },

      clickPostlocation: function() {
        var postLocationId = this.get('post.location.id');
        var controller = this.get('controller');
        var detailsForMarker = controller.get('content.markers').findBy('location_id', postLocationId);
           // this.send('showDiscourseModal', 'placeDetailsModal', detailsForMarker);
        controller.send('showDiscourseModal', 'placeDetailsModal', detailsForMarker);

        // controller.set('activePost', post);
        // Discourse.URL.jumpToPost(1);

        // $("#post_" + this.get("post.post_number") + " .cooked").toggle();
        // this.toggleProperty("post.temporarily_hidden");
      }
    });

  }
};
