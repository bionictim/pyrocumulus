(function () {

    $.fn.extend({
        setData: function (key, value) {
            this.data(key, value);
            this.attr("data-" + key, value);

            return this;
        }
    });

    App.Utils = {
        settings: {
            defaultThumbnail: "images/background-carbon-fiber.jpg" //"images/missing.png"
        },

        getViewportSize: function () {
            var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            return {
                width: w,
                height: h
            };
        },

        getThumbnailUrl: function (url) {
            return url || App.Utils.settings.defaultThumbnail;
        },

        formatBackgroundImageCss: function (url) {
            return "url('" + App.Utils.getThumbnailUrl(url) + "')";
        },

        addCss: function (css) {
            var head = document.getElementsByTagName('head')[0];
            var s = document.createElement('style');
            s.setAttribute('type', 'text/css');
            if (s.styleSheet) {   // IE
                s.styleSheet.cssText = css;
            } else {                // the world
                s.appendChild(document.createTextNode(css));
            }
            head.appendChild(s);
        },

        loadImage: function (imageUrl, onloaded) {
            onloaded = onloaded || function () { };

            if (!imageUrl) {
                onloaded();
                return;
            }

            var $img = $("<img />");
            $img.bind("load", function () {
                onloaded();
            });

            $img.attr("src", imageUrl);
        },

        shuffle: function (array) {
            var n = array.length;
            for (var i = n - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = array[i];
                array[i] = array[j];
                array[j] = tmp;
            }
        },

        grabImages: function (url) {
            url = url.replace("http://", "").replace("https://", "");
            url = "pyroxy1/" + url;

            return $.ajax({
                url:url,
                success: function (data) {
                    var $img = $(data).find("img");
                    $("body").append("<div id='zzz' style='position:absolute;z-index:2000;'></div>");
                    $img.each(function (i, o) { $("#zzz").append(o); })
                }
            })

        },

        Binding: {
            process: function (element, data) {
                //var $element = $(element);
                //var 
            }
        },

        // TODO
        Encryption: {
            encrypt: function (val) {
                return val;
            },
            decrypt: function (val) {
                return val;
            }
        },

        Debug: {
            _$debug: null,

            write: function (message) {
                if (!App.Utils.Debug._$debug) {
                    App.Utils.Debug._$debug = $("<div id='debug' style='position:fixed;z-index:1000;top:0;right:0'></div>");
                    $("body").append(App.Utils.Debug._$debug);
                    App.Utils.Debug._$debug.click(function () {
                        $(this).html("");
                    });
                }

                App.Utils.Debug._$debug.html(App.Utils.Debug._$debug.html() + "<br />" + message);
            }
        }
    };

    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, "");
    };
    String.prototype.ltrim = function () {
        return this.replace(/^\s+/, "");
    };
    String.prototype.rtrim = function () {
        return this.replace(/\s+$/, "");
    };
    String.prototype.isNumeric = function () {
        return (this - 0) == this && this.length > 0;
    };
    String.prototype.startsWith = function (str) {
        return (this.indexOf(str) === 0);
    };
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
})();
