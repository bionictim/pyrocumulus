App = (function (jquery, underscore, pogoplug) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var Pogoplug = pogoplug;

    var Section = {
        login: "login",
        services: "services",
        files: "files"
    };

    var _m = {
        $allSections: null,
        $sections: {}
    };

    var sectionSelector = function (section) {
        return "#" + section;
    };

    var showSection = function (section) {
        if (!section) {
            if (!Pogoplug.isLoggedIn())
                section = Section.login;
            else if (!Pogoplug.cacheParams().deviceid)
                section = Section.services;
            else {
                section = Section.files;
            }
        }

        _m.$allSections.removeClass("visible");
        _m.$sections[section].addClass("visible");
    };

    var bindEvents = function () {
    };

    var render = function () {
        if (Pogoplug.isLoggedIn()) {
            var servicesModel = App.LocalStorage.get(App.LocalStorage.Keys.services);

            if (!servicesModel) {
                var request = Pogoplug.makeRequest("listServices");
                request.then(function (data, status) {
                    App.ServiceList.render(data);
                    showSection();
                });
            } else {
                App.ServiceList.render(servicesModel);
                showSection();
            }
        } else {
            showSection();
        }
    }

    var init = function () {
        _m.$allSections = $("section");
        _.each(Section, function (section) {
            _m.$sections[section] = $("#" + section);
        });

        App.Login.init(Section.login);
        App.Login.setCallback("loggedIn", function (user) {
            console.log("Welcome, " + user.screenname + ".");
            var service = App.LocalStorage.get(App.LocalStorage.Keys.selectedService);

            if (!!service) {
                Pogoplug.cacheParams({
                    deviceid: service.deviceid,
                    serviceid: service.serviceid
                });
            }

            render();
        });

        App.ServiceList.init(Section.services);
        App.ServiceList.setCallback("serviceSelected", function (service) {
            console.log("serviceSelected. ", "serviceId: " + service.serviceid, " deviceId: " + service.deviceid);
            Pogoplug.cacheParams({
                deviceid: service.deviceid,
                serviceid: service.serviceid
            });
            App.LocalStorage.set(App.LocalStorage.Keys.selectedService, service);
            render();
        });

        render();
    };

    return {
        init: init
    };

})($, _, Pogoplug);