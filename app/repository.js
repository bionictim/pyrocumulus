App.Repository = (function (jquery, underscore, pogoplug) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var Pogoplug = pogoplug;

    var Consts = {
    };

    var _m = {
    };

    var get = function (endpointOrKey, params) {
        var deferred = $.Deferred();

        var endpoint = Pogoplug.getEndpoint(endpointOrKey);
        var params = Pogoplug.getRequestParams(endpointOrKey, params);
        var cacheKey = Pogoplug.getCacheKey(endpoint.method, params);
        var result = App.LocalStorage.get(cacheKey);

        if (!!result) {
            //console.log("Cached: ", result);
            deferred.resolve(result);
        } else {
            var request = Pogoplug.makeRequest(endpoint, params); // TODO: support args
            request.then(function (data, status) {
                deferred.resolve(data, status);
            });
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
        var params = { fileid: fileid || "0"};
        return get("getFile", params);
    };

    var getThumbnail = function (parentid) {
        var deferred = $.Deferred();

        var params = { parentid: parentid || "0" };
        var result = App.LocalStorage.get(App.LocalStorage.Keys.thumbnail, params);

        if (!!result) {
            deferred.resolve(result);
        } else {
            App.ViewModel.FileListViewModel.load(parentid).then(function (viewModel) {
                var thumbnail = App.ViewModel.FileListViewModel.getThumbnail(viewModel.images);
                App.LocalStorage.set(App.LocalStorage.Keys.thumbnail, params, thumbnail);
                deferred.resolve();
            });
        }

        return deferred.promise();
    };

    var init = function () {

    };

    return {
        init: init,
        getServices: getServices,
        getFiles: getFiles,
        getFile: getFile,
        getThumbnail: getThumbnail
    };
})($, _, Pogoplug);