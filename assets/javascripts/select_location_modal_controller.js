Discourse.SelectLocationModalController = Discourse.Controller.extend(Discourse.ModalFunctionality, {
    uniqueUsernameValidation: null,

    // resetForm: function() {
    //     this.setProperties({
    //         facebookUrl: '',
    //     });
    // },

    // submitDisabled: function() {
    //     return false;
    // }.property('passwordRequired', 'urlValidation.failed', 'formSubmitted'),



    actions: {
        locationSelected: function(latlng, geocodedLocation) {
            var locationObject = {
                formattedAddress: geocodedLocation.formatted_address,
                latitude: latlng.lat(),
                longitude: latlng.lng()
            }
            this.set('locationObject', locationObject);
        },
        addLocationToTopic: function() {
            if (this.get('locationObject')) {
                debugger;
                this.set('model.locationObject', this.get('locationObject'));

            };
            // var self = this;
            // debugger;
            this.send('closeModal');
            // this.set('formSubmitted', true);


        }
    }
});
