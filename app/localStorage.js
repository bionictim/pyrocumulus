App.LocalStorage = (function () {
    "use strict";

    var Consts = {
        keyPrefix: "Pyro-"
    };

    var Keys = {
        valtoken: "valtoken",
        services: "services",
        selectedService: "selectedService",
        directory: "directory",
        playlist: "playlist"
    };

    var KeyPatterns = {
        valtoken: "valtoken",
        services: "services",
        selectedService: "selectedService",
        directory: "directory_{fileid}",
        playlist: "playlist_{name}"
    };

    var getKey = function (key, args) {
        var result;

        if (!KeyPatterns[key])
            result = Consts.keyPrefix + key;
        else
            result = Consts.keyPrefix + KeyPatterns[key];

        if (!!args) {
            _.each(args, function (argVal, argName) {
                result = result.replace("{" + argName + "}", argVal);
            })
        }

        return result;
    };

    var get = function (key, args) {
        var result = null;
        var json = localStorage.getItem(getKey(key, args));
        if (!!json)
            result = JSON.parse(json);

        return result;
    };

    var set = function (key, args, val) {
        if (typeof val === "undefined") {
            val = args;
            args = null;
        }

        val = JSON.stringify(val);

        localStorage.setItem(getKey(key, args), val);
    };

    return {
        Keys: Keys,
        get: get,
        set: set
    };
})();