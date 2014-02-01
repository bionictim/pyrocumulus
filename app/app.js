App = (function (jquery, underscore, pogoplug) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var Pogoplug = pogoplug;

    var Consts = {
        version: "1.000038"
    };

    var Section = {
        login: "login",
        services: "services",
        files: "files"
    };

    var _m = {
        $allSections: null,
        $sections: {}
    };

    var init = function () {
        App.Cache.init();
        App.Repository.init(App.Cache);

        // TODO: Refactor most of this to a "main" view, but this part stays in "app".
        App.View.init(Consts.version);

        // TODO: "main" view stuffs after refactoring to a view.
        bindEventsOneTime();

        _m.$allSections = $("section");
        _.each(Section, function (section) {
            _m.$sections[section] = $("#" + section);
        });

        App.Player.init("playerContainer");

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

        App.FileList.init(Section.files);
        // TODO: callback?

        (function () {
            function disableselect(e) {
                return false
            }
            function reEnable() {
                return true
            }
            document.onselectstart = new Function("return false")
            if (window.sidebar) {
                document.onmousedown = disableselect
                document.onclick = reEnable
            }

            $("body").on("dragstart", function (e) {
                return false;
            }).on("drop", function (e) {
                return false;
            });
        })();

        render();
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

                var currentDirectory = App.LocalStorage.get(App.LocalStorage.Keys.currentDirectory);
                var currentDirectoryId = !!currentDirectory ? currentDirectory.fileid : null;

                App.ViewModel.FileListViewModel.load(currentDirectoryId).then(function (viewModel) {
                    App.FileList.render(viewModel);
                });
            }
        }

        _m.$allSections.removeClass("visible");
        _m.$sections[section].addClass("visible");
    };

    var bindEventsOneTime = function () {
        $(window).on("resize", handleResize);
    };

    var handleResize = function (e) {
        App.Player.handleResize();
    };

    var render = function () {
        if (Pogoplug.isLoggedIn()) {
            App.Repository.getServices().then(function (data, status) {
                App.ServiceList.render(data);
                showSection();
            });
        } else {
            showSection();
        }
    };

    return {
        init: init
    };

})($, _, Pogoplug);