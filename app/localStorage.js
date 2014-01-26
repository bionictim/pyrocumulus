App.LocalStorage = (function () {
    "use strict";

    var Consts = {
        keyPrefix: "Pyro-"
    };

    var Keys = {
        valtoken: "valtoken",
        //services: "services",
        selectedService: "selectedService",
        currentDirectory: "currentDirectory",
        //playlist: "playlist",
        playlist: "playlist_{name}",
        thumbnail: "thumbnail_{parentid}"
    };

    var KeyPatterns = {
        //valtoken: "valtoken",
        //services: "services",
        //selectedService: "selectedService",
        //directory: "directory_{fileid}",
        //playlist: "playlist_{name}",
        //thumbnail: "thumbnail_{fileid}"
    };

    var _m = {
        localStorageAvailable: true,
        requestingQuotaIncrease: false
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
        if (_m.localStorageAvailable) {
            if (typeof val === "undefined") {
                val = args;
                args = null;
            }

            val = JSON.stringify(val);

            try {
                localStorage.setItem(getKey(key, args), val);
            } catch (e) {
                //_m.localStorageAvailable = false;

                if (e.name === "QUOTA_EXCEEDED_ERR" || e.name === "QuotaExceededError") {
                    if (navigator.webkitPersistentStorage && navigator.webkitPersistentStorage.requestQuota) {

                        console.log("Clearing local storage because it's full.");
                        clear();
                        localStorage.setItem(getKey(key, args), val);

                        // NOT WORKING!!!

                        //if (!_m.requestingQuotaIncrease) {
                        //    navigator.webkitTemporaryStorage.requestQuota(10*1024*1024*1024, function (bytes) {
                        //        console.log("Quota is available: " + bytes);
                        //        _m.requestingQuotaIncrease = false;
                        //    },
                        //    function (e) {
                        //        console.log("Error allocating quota: " + e);
                        //    });

                        //    _m.requestingQuotaIncrease = true;
                        //}

                        //if (!_m.requestingQuotaIncrease) {
                        //    navigator.webkitPersistentStorage.queryUsageAndQuota(function (used, total) {
                        //        navigator.webkitPersistentStorage.requestQuota(total * 2, function (bytes) {
                        //            alert("Quota is available: " + bytes);
                        //            _m.requestingQuotaIncrease = false;
                        //        },
                        //        function (e) {
                        //            alert("Error allocating quota: " + e);
                        //        });
                        //    },
                        //    function (e) {
                        //        console.log("Error querying local storage: " + e)
                        //    });

                        //    _m.requestingQuotaIncrease = true;
                        //}
                    } else {
                        console.log("Clearing local storage because it's full.");
                        clear();
                        localStorage.setItem(getKey(key, args), val);
                    }
                } else {
                    //_m.localStorageAvailable = false;
                    console.log("Unknown Local storage write failure - " + e);
                }
            }
        }
    };

    var clear = function (cacheKeyPart) {
        cacheKeyPart = cacheKeyPart || "";
        var cacheKeyPrefix = Consts.keyPrefix + cacheKeyPart;
        var cacheKeyPrefixLength = cacheKeyPrefix.length;
        var keysToRemove = [];

        for (var i = 0, len = localStorage.length; i < len; i++) {
            var key = localStorage.key(i);
            if (key.substr(0, cacheKeyPrefixLength) === cacheKeyPrefix)
                keysToRemove.push(key);
        }

        keysToRemove.forEach(function (key) {
            localStorage.removeItem(key);
        });
    };

    return {
        Keys: Keys,
        get: get,
        set: set,
        clear: clear
    };
})();