(function () {
    App.Utils = {
        settings: {
            defaultThumbnail: "images/missing.png"
        },

        getThumbnailUrl: function (url) {
            return url || App.Utils.settings.defaultThumbnail;
        },

        formatBackgroundImageCss: function (url) {
            return "url('" + App.Utils.getThumbnailUrl(url) + "')";
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
