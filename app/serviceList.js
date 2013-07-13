App.ServiceList = (function (jquery, underscore, ejs) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var EJS = ejs;

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
            var html = new EJS({ url: "/templates/serviceList.html?__v=1" }).render(model);
            _m.$container.html(html);
        }

        bindEvents();
    };

    var bindEvents = function () {
        $("li a", _m.containerSelector).click(function (e) {
            e.preventDefault();
            var $item = $(this).parent();
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
    };

    return {
        setCallback: setCallback,
        init: init,
        render: render,
        getModel: function () { return _m.model; }
    };

})($, _, EJS);