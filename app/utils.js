App.Utils = {
    settings: {
        defaultThumbnail: "images/missing.png"
    },

    getThumbnailUrl: function (url) {
        return url || App.Utils.settings.defaultThumbnail;
    }
};