App.Login = (function (jquery, underscore, pogoplug) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var Pogoplug = pogoplug;

    var _m = {
        containerSelector: ""
    };

    var callbacks = {
        loggedIn: function (user) { }
    };

    var setCallback = function (name, callback) {
        callbacks[name] = callback;
    };

    var bindEvents = function () {
        $("form", _m.containerSelector).submit(function () {
            var data = $(this).serializeFormJSON();

            if (!data.email || !data.password) {
                // Invalid.
            } else {
                var request = Pogoplug.login(data.email, data.password);
                request.then(function (data, status) {
                    callbacks.loggedIn(data.user);
                });
            }

            return false;
        });
    };

    var init = function (containerId) {
        _m.containerSelector = "#" + containerId;
        bindEvents();
    };

    return {
        setCallback: setCallback,
        init: init
    };

})($, _, Pogoplug);

(function ($) {
    $.fn.serializeFormJSON = function () {

        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
})(jQuery);