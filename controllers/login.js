App.Login = (function (jquery, underscore, cookies) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var docCookies = cookies;

    var _m = {
        $form: null,
        $fields: {
            email: null,
            password: null,
            remember: null
        }
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

    var options = {

        viewName: "login",

        callbacks: {
            loggedIn: function (user) { }
        },

        afterInit: function () {
            this.render({});
            tryAutoLogin();
        },

        bindEventsOnce: function () {
            this.$container.on("click", "button[type='submit']", function (e) {
                e.preventDefault();
                _m.$form.submit();
            });
        },

        bindEventsAfterRender: function () {
            var self = this;

            _m.$form = this.$container.find("form");

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
                        self.callbacks.loggedIn(data.user);
                    }, function () { // jqXHR, textStatus, errorThrown
                        alert("Login failed.");
                    });
                }

                return false;
            });
        }
    };

    return new App.Controller(options);

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