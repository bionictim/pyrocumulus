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
        var endpoint = Pogoplug.getEndpoint(endpointOrKey);
        var params = Pogoplug.getRequestParams(endpointOrKey, params);
        var cacheKey = Pogoplug.getCacheKey(endpoint.method, params);

        var deferred = $.Deferred();
        var result = App.LocalStorage.get(cacheKey);

        if (!!result) {
            console.log("Cached: ", result);
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
        var params = !!parentid ? { parentid: parentid } : null;
        return get("listFiles", params);
    };

    var init = function () {

    };

    return {
        init: init,
        getServices: getServices,
        getFiles: getFiles
    };
})($, _, Pogoplug);