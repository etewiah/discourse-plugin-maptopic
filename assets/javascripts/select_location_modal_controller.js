Discourse.SelectLocationModalController =  Discourse.Controller.extend(Discourse.ModalFunctionality, {
  uniqueUsernameValidation: null,

  resetForm: function() {
    this.setProperties({
      facebookUrl: '',
    });
  },

  submitDisabled: function() {
    // if (!this.get('passwordRequired')) return false; // 3rd party auth
    // if (this.get('formSubmitted')) return true;
    // if (this.get('tosAcceptRequired') && !this.get('tosAccepted')) return true;
    // if (this.get('urlValidation.failed')) return true;
    // if (this.get('emailValidation.failed')) return true;
    // if (this.get('usernameValidation.failed')) return true;
    // if (this.get('passwordValidation.failed')) return true;
    return false;
  }.property('passwordRequired', 'urlValidation.failed',  'formSubmitted'),

  // passwordRequired: function() {
  //   return this.blank('authOptions.auth_provider');
  // }.property('authOptions.auth_provider'),
  //
  // passwordInstructions: function() {
  //   return I18n.t('user.password.instructions', {count: Discourse.SiteSettings.min_password_length});
  // }.property(),

  // Validate the name
  urlValidation: function() {
    // If blank, fail without a reason
    if (this.blank('facebookUrl')) return Discourse.InputValidation.create({ failed: true });


    // If too short
    if (this.get('facebookUrl').length < 3) {
      return Discourse.InputValidation.create({
        failed: true,
        reason: I18n.t('user.name.too_short')
      });
    }

    // Looks good!
    return Discourse.InputValidation.create({
      ok: true,
      reason: I18n.t('user.name.ok')
    });
  }.property('facebookUrl'),

  actions: {
    addLocationToTopic: function() {
      var self = this;
      debugger
      this.set('formSubmitted', true);
      var url = this.get('facebookUrl');
      // var email = this.get('accountEmail');
      // var password = this.get('accountPassword');
      // var username = this.get('accountUsername');
      // var passwordConfirm = this.get('accountPasswordConfirm');
      // var challenge = this.get('accountChallenge');
      return Discourse.Gig.createFromUrl(url).then(function(result) {
        debugger;
        if (result.success) {
          self.flash(result.message);
          self.set('complete', true);
        } else {
          self.flash(result.message || I18n.t('create_account.failed'), 'error');
          if (result.errors && result.errors.email && result.errors.email.length > 0 && result.values) {
            self.get('rejectedEmails').pushObject(result.values.email);
          }
          if (result.errors && result.errors.password && result.errors.password.length > 0) {
            self.get('rejectedPasswords').pushObject(password);
          }
          self.set('formSubmitted', false);
        }
        if (result.active && !Discourse.SiteSettings.must_approve_users) {
          return window.location.reload();
        }
      }, function() {
        self.set('formSubmitted', false);
        return self.flash(I18n.t('create_account.failed'), 'error');
      });
    }
  }
});
