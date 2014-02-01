App.Repository = (function (jquery, underscore, pogoplug) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var Pogoplug = pogoplug;

    var Consts = {
    };

    var _m = {
        cache: null
    };

    var get = function (endpointOrKey, params, memCacheStore, memCacheKey) {
        var deferred = $.Deferred();
        var result;

        // First try memory cache.
        if (!!memCacheStore && !!memCacheKey)
            result = _m.cache.get(memCacheStore, memCacheKey);

        if (!!result)
            deferred.resolve(result);
        else {
            var endpoint = Pogoplug.getEndpoint(endpointOrKey);
            var params = Pogoplug.getRequestParams(endpointOrKey, params);
            var cacheKey = Pogoplug.getCacheKey(endpoint.method, params);

            // Next try local storage
            result = App.LocalStorage.get(cacheKey);

            if (!!result) {
                //console.log("Cached: ", result);
                if (!!memCacheStore && !!memCacheKey)
                    _m.cache.set(memCacheStore, memCacheKey, result);

                deferred.resolve(result);
            } else {
                // Finally, get it from the service.
                var request = Pogoplug.makeRequest(endpoint, params); // TODO: support args
                request.then(function (data, status) {
                    if (!!memCacheStore && !!memCacheKey)
                        _m.cache.set(memCacheStore, memCacheKey, result);

                    deferred.resolve(data, status);
                });
            }
        }

        return deferred.promise();
    };

    var getServices = function () {
        return get("listServices");
    };

    var getFiles = function (parentid) {
        var params = !!parentid ? { parentid: parentid, maxcount: 1000 } : null;
        return get("listFiles", params);
    };

    var getFile = function (fileid) {
        var params = { fileid: fileid || "0" };
        return get("getFile", params, _m.cache.stores.files, fileid);
    };

    //var getThumbnail = function (parentid) {
    //    var deferred = $.Deferred();

    //    var params = { parentid: parentid || "0" };
    //    var result = App.LocalStorage.get(App.LocalStorage.Keys.thumbnail, params);

    //    if (!!result) {
    //        deferred.resolve(result);
    //    } else {
    //        App.ViewModel.FileListViewModel.load(parentid).then(function (viewModel) {
    //            var thumbnail = App.ViewModel.FileListViewModel.getThumbnail(viewModel.images);
    //            App.LocalStorage.set(App.LocalStorage.Keys.thumbnail, params, thumbnail);
    //            deferred.resolve();
    //        });
    //    }

    //    return deferred.promise();
    //};

    var init = function (cache) {
        _m.cache = cache;
    };

    return {
        init: init,
        getServices: getServices,
        getFiles: getFiles,
        getFile: getFile
        //,
        //getThumbnail: getThumbnail
    };
})($, _, Pogoplug);