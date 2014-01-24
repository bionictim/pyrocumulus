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
        }
    };
})();
