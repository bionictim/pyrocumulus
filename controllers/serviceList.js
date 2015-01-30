App.ServiceList = (function (jquery, underscore) {
    "use strict";

    var $ = jquery;
    var _ = underscore;

    var options = {

        viewName: "serviceList",

        callbacks: {
            serviceSelected: function (serviceid, deviceid) { }
        },

        bindEventsOnce: function () {
            this.$container.on("click", "li a", function (e) {
                e.preventDefault();
                var $item = $(e.currentTarget).parent();
                var deviceid = $item.data("deviceid");
                var serviceid = $item.data("serviceid");
                var name = $item.data("name");

                this.callbacks.serviceSelected({
                    serviceid: serviceid,
                    deviceid: deviceid,
                    name: name
                });
            });
        }
    };

    return new App.Controller(options);

})($, _);