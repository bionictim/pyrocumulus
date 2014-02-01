App.Cache = (function (jquery, underscore) {
    "use strict";

    var $ = jquery;
    var _ = underscore;

    var Consts = {
        stores: {
            files: "files",
            fileViewModels: "fileViewModels",
            fileListViewModels: "fileListViewModels",
            songInfos: "songInfos",
            fileTypes: "fileTypes",
            thumbnails: "thumbnails"
        }
    };

    var _m = {
        cache: {}
    };

    var get = function (storeKey, cacheKey) {
        return _m.cache[storeKey][cacheKey];
    };

    var set = function (storeKey, cacheKey, val) {
        _m.cache[storeKey][cacheKey] = val;
    };

    var init = function () {
        // Initialize stores.
        Object.keys(Consts.stores).forEach(function (key) {
            _m.cache[key] = {};
        });
    };

    return {
        init: init,
        stores: Consts.stores,
        get: get,
        set: set,
        _cache: function () { return _m.cache; }
    };
})($, _);