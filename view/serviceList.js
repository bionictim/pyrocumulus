App.ServiceList = (function (jquery, underscore, ejs) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var EJS = ejs;

    var Consts = {
        viewName: "serviceList"
    };

    var _m = {
        model: null,
        containerSelector: "",
        $container: null
    };

    var callbacks = {
        serviceSelected: function (serviceid, deviceid) { }
    };

    var setCallback = function (name, callback) {
        callbacks[name] = callback;
    };

    var render = function (model) {
        if (model) {
            _m.model = model;
            var html = App.Controller.render(Consts.viewName, model);
            _m.$container.html(html);
        }
    };

    var bindEventsOnce = function () {
        _m.$container.on("click", "li a", function (e) {
            e.preventDefault();
            var $item = $(e.currentTarget).parent();
            var deviceid = $item.data("deviceid");
            var serviceid = $item.data("serviceid");
            var name = $item.data("name");

            callbacks.serviceSelected({
                serviceid: serviceid,
                deviceid: deviceid,
                name: name
            });
        });
    };

    var init = function (containerId) {
        _m.containerSelector = "#" + containerId;
        _m.$container = $(_m.containerSelector);
        bindEventsOnce();
    };

    return {
        setCallback: setCallback,
        init: init,
        render: render,
        getModel: function () { return _m.model; }
    };

})($, _, EJS);