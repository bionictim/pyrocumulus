App = (function (jquery, underscore, pogoplug) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var Pogoplug = pogoplug;

    var Consts = {
        version: "1.000063"
    };

    var Section = {
        login: "login",
        services: "services",
        files: "files"
    };

    var _m = {
        $app: null,
        $allSections: null,
        $sections: {}
    };

    var toggleScroll = function (shouldScroll) {
        if (shouldScroll === null || typeof shouldScroll === "undefined") {
            _m.$app.toggleClass("no-scroll");
        } else {
            if (shouldScroll)
                _m.$app.removeClass("no-scroll");
            else
                _m.$app.addClass("no-scroll");
        }
    };

    var init = function () {
        App.Cache.init();
        App.Repository.init(App.Cache);

        // TODO: Refactor most of this to a "main" view, but this part stays in "app".
        App.View.init(Consts.version);

        // TODO: "main" view stuffs after refactoring to a view.
        bindEventsOneTime();

        _m.$app = $("#app");
        _m.$allSections = $("section");
        _.each(Section, function (section) {
            _m.$sections[section] = $("#" + section);
        });

        App.Visualization.init("visualization");

        App.Player.init("playerContainer");
        App.Player.setCallback("songChanged", function (fileId) {
            App.Visualization.update(fileId);
        });
        App.Player.setCallback("showVisualization", function (fileId) {
            App.Visualization.update(fileId).then(function () {
                App.Visualization.start();
                App.Visualization.show();  
            });
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

    var _handleResize = function (e) {
        var vpSize = App.Utils.getViewportSize();

        if (vpSize.width > vpSize.height) {
            _m.$app.setData("data-orientation", "landscape");
        } else {
            _m.$app.setData("data-orientation", "portrait");
        }

        _.delay(function () {
            _.each([
                "FileList",
                "Visualization",
                "Player",
            ], function (controller) {
                App[controller].handleResize();
            });
        }, 100);
    };

    var handleResize = _.debounce(_handleResize, 100);

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
        init: init,
        handleResize: handleResize,
        toggleScroll: toggleScroll
    };

})($, _, Pogoplug);