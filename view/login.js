App.Login = (function (jquery, underscore, cookies) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var docCookies = cookies;

    var Consts = {
        viewName: "login"
    };

    var _m = {
        containerSelector: "",
        $form: null,
        $fields: {
            email: null,
            password: null,
            remember: null
        }
    };

    var callbacks = {
        loggedIn: function (user) { }
    };

    var setCallback = function (name, callback) {
        callbacks[name] = callback;
    };

    var init = function (containerId) {
        _m.containerSelector = "#" + containerId;
        _m.$container = $(_m.containerSelector);

        bindEventsOnce();

        render({});
        tryAutoLogin();
    };

    var render = function (model) {
        if (model) {
            _m.model = model;
            var html = App.View.render(Consts.viewName, model);
            _m.$container.html(html);

            bindEventsAfterRender();
        }
    };

    var bindEventsOnce = function () {
        _m.$container.on("click", "button[type='submit']", function (e) {
            e.preventDefault();
            _m.$form.submit();
        });
    };

    var bindEventsAfterRender = function () {
        _m.$form = _m.$container.find("form");

        Object.keys(_m.$fields).forEach(function (key) {
            _m.$fields[key] = _m.$form.find("[name='" + key + "']");
        });

        _m.$form.submit(function (e) {
            e.preventDefault();

            if (_m.$fields.remember.is(':checked')) {
                var email = App.Utils.Encryption.encrypt(_m.$fields.email.val());
                var password = App.Utils.Encryption.encrypt(_m.$fields.password.val());

                // set cookies to expire in 14 days
                var expirationDays = 14 * 60 * 60 * 24;
                docCookies.setItem('email', email, expirationDays);
                docCookies.setItem('password', password, expirationDays);
                docCookies.setItem('remember', true, expirationDays);
            }
            else {
                // reset cookies
                docCookies.removeItem('email', null);
                docCookies.removeItem('password', null);
                docCookies.removeItem('remember', null);
            }

            var data = $(this).serializeFormJSON();

            if (!data.email || !data.password) {
                alert("Please enter your email and password.");
            } else {
                var request = Pogoplug.login(data.email, data.password);
                request.then(function (data, status) {
                    callbacks.loggedIn(data.user);
                }, function () { // jqXHR, textStatus, errorThrown
                    alert("Login failed.");
                });
            }

            return false;
        });
    };

    var tryAutoLogin = function () {
        var remember = docCookies.getItem('remember');
        if (remember == 'true') {
            var email = App.Utils.Encryption.decrypt(docCookies.getItem('email'));
            var password = App.Utils.Encryption.decrypt(docCookies.getItem('password'));

            // autofill the fields
            _m.$fields.email.val(email);
            _m.$fields.password.val(password);
            _m.$fields.remember.attr("checked", "checked");
            _m.$form.submit();
        }
    };

    return {
        setCallback: setCallback,
        init: init
    };

})($, _, docCookies);

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
})($);