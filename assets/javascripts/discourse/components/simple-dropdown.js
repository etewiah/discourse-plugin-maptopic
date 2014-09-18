// https://github.com/silviomoreto/bootstrap-select/blob/master/bower.json
Discourse.SimpleDropdownComponent = Ember.Component.extend({

  // dropdownId: 'dd',
  tagName: 'span',


  didInsertElement: function() {
    // this.set('currentSelectionItem', currentSelectionItem);
    this.set('currentSelectionItem.class', 'hidden');

    function DropDown(el) {
      this.dd = el;
      this.initEvents();
    }
    DropDown.prototype = {
      initEvents: function() {
        var obj = this;

        // obj.dd.on('click', function(event) {
        //   if (event.target.dataset.val) {
        //     this.currentSelection = event.target.dataset.val;
        //   }
        //   $(this).toggleClass('active');
        //   event.stopPropagation();
        // });
      }
    }


    var self = this;

    // $(function() {
    var ddElement = this.$('.wrapper-dropdown-5');
    // var dd = new DropDown(ddElement);

    ddElement.on('click', function(event) {
      if (event.target.dataset.val) {
        // debugger;
        self.set('currentSelectionItem.class', 'visible');
        // $(this).find('.hidden').toggleClass();
        // $(this).toggleClass('hidden');

        var currentSelectionItem = self.get('selectionItems').findBy('value', event.target.dataset.val )
        self.set('currentSelectionItem', currentSelectionItem);
        self.set('currentSelectionItem.class', 'hidden');
        event.preventDefault();
        // debugger;
        self.sendAction('action', currentSelectionItem.value);
      }
      $(this).toggleClass('active');
      event.stopPropagation();
      // event.preventDefault();
    });

    $(document).click(function() {
      // all dropdowns
      $('.wrapper-dropdown-5').removeClass('active');
    });

    // });
  }

  // this._super();
  // Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);


  // this.$('a[data-dropdown]').on('click.dropdown', function(e) {
  // not quite sure why 'this.$('#select-timerange')' does not work......
  // $('#select-timerange').on('click.dropdown', function(e) {
  //   self.showDropdown.apply(self, [$(e.currentTarget)]);
  //   return false;
  // });

  // this.$('.selectpicker').selectpicker();
  // this.$('.selectpicker').selectpicker('val', 'this week');
  // // 'val', 'Mustard');
  // var that = this;
  // this.$('.selectpicker').change(function(){
  //   // console.log(that);
  //   var newTimeRange = that.$('.selectpicker').val();
  //   var newTimeRangeValue = newTimeRange;
  //   if (newTimeRange === "next week") {
  //     newTimeRangeValue = "next_week";
  //   } else{};
  //   EmberAppSettings.default_gig_search_range = newTimeRangeValue;
  //   that.sendAction();
  //   // that.transitionTo('gigs_root');
  // })


});
