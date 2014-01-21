
Pogoplug = (function (jquery, underscore) {
    "use strict";

    var $ = jquery;
    var _ = underscore;

    var Format = {
        soap: "soap",
        xml: "xml",
        json: "json"
    };

    var HttpMethod = {
        Get: "GET",
        Post: "POST"
    };

    var Sort = {
        nameAsc: "+name",
        nameDesc: "-name",
        dateAsc: "+date",
        dateDesc: "-date",
        typeAsc: "+type",
        typeDesc: "-type",
        sizeAsc: "+size",
        sizeDesc: "-size"
    };

    var Consts = {
        paramsToOmitFromCacheKey: [
            "valtoken"
        ]
    };

    var Enums = {
        FileType: {
            file: 0,
            directory: 1
        }
    };

    var _m = {
        options: {
            baseUrl: null,
            format: null
        },
        cachedParams: {
            valtoken: null,
            deviceid: null,
            serviceid: null
        }
    };

    var defaults = {
        baseUrl: "/api/",
        format: Format.json
    };

    var endpoints = {
        getVersion: {
            method: "getVersion"
        },
        loginUser: {
            method: "loginUser",
            params: {
                required: {
                    email: "",
                    password: ""
                }
            },
            retVal: {
                valtoken: "",
                user: {
                    email: "",
                    screenname: "",
                    userid: "",
                    locale: ""
                }
            }
        },
        getUser: {
            method: "getUser",
            params: {
                required: {
                    valtoken: ""
                }
            }
        },
        listDevices: {
            method: "listDevices",
            params: {
                required: {
                    valtoken: ""
                }
            }
        },
        listServices: {
            method: "listServices",
            params: {
                required: {
                    valtoken: ""
                },
                optional: {
                    deviceid: "",
                    shared: false
                }
            },
            retVal: {
                services: [{
                    name: "",
                    apiurl: "",
                    deviceid: "",
                    device: {
                        deviceid: "",
                        name: "",
                        ownerid: "",
                        type: "",
                        version: ""
                    },
                    serviceid: "",
                    type: "",
                    version: ""
                }]
            }
        },
        listFiles: {
            method: "listFiles",
            params: {
                required: {
                    valtoken: "",
                    deviceid: "",
                    serviceid: ""
                },
                optional: {
                    spaceid: "",
                    parentid: "",
                    pageoffset: 0,
                    maxcount: 1000,
                    searchcrit: "", // false,
                    sortcrit: Sort.nameAsc
                }
            }
        },
        searchFiles: {
            method: "searchFiles",
            params: {
                required: {
                    valtoken: "",
                    searchcrit: ""
                },
                optional: {
                    pageoffset: 0,
                    maxcount: 1000,
                    sortcrit: Sort.nameAsc
                }
            }
        },
        getFile: {
            method: "getFile",
            params: {
                required: {
                    valtoken: "",
                    deviceid: "",
                    serviceid: ""
                },
                optional: {
                    fileid: "", // Exclusive to path parameter. Use only one.
                    path: "" // Exclusive to fileid parameter. Use only one.
                }
            }
        },
        createFile: "createFile",
        removeFile: "removeFile",
        copyFile: "copyFile",
        transferProgress: "transferProgress",
        listShares: "listShares",
        createShare: "createShare",
        deleteShare: "deleteShare",
        listSharedUsers: "listSharedUsers",
        addSharedUser: "addSharedUser",
        removeSharedUser: "removeSharedUser"
    };

    var getEndpoint = function (endpointOrKey) {
        var result = (typeof endpointOrKey == "object") ?
            endpointOrKey :
            endpoints[endpointOrKey];

        return result;
    };

    var getRequestParams = function (endpointOrKey, params) {
        params = params || cloneParams(endpointOrKey).required;
        applyStoredParams(endpointOrKey, params);
        cleanupParams(params);

        return params;
    };

    var cloneParams = function (endpointOrKey, asOneList) {
        var endpoint = getEndpoint(endpointOrKey);
        var result = null;

        if (!!endpoint) {
            if (asOneList)
                result = $.extend(true, {}, endpoint.params.required, endpoint.params.optional);
            else
                result = $.extend(true, {}, endpoint.params);
        }

        return result;
    };

    var login = function (email, password) {
        var endpoint = endpoints.loginUser;
        var params = _.clone(endpoint.params);

        params.email = email;
        params.password = password;

        var request = makeRequest(endpoint.method, params, null, null, { noCache: true });

        request.then(function (data, status) {
            if (!!data.valtoken) {
                _m.cachedParams.valtoken = data.valtoken;
            }
        });

        return request;
    }

    var isLoggedIn = function () {
        return !!_m.cachedParams.valtoken;
    };

    var getResult = function (endpointOrKey, rawResult) {
        var result = {};
        var endpoint = getEndpoint(endpointOrKey);
        var retVal = endpoint.retVal;

        if (!!retVal) {
            deepPick(result, rawResult, retVal);
        } else {
            result = rawResult;
        }

        return result;
    };

    // TODO: Maybe should be a util.
    var deepPick = function (resultObject, rawObject, whitelistObject) {
        var keys = _.keys(whitelistObject);

        _.each(keys, function (key) {
            if (_.isArray(whitelistObject[key])) {
                resultObject[key] = [];
                _.each(rawObject[key], function (item) {
                    resultObject[key].push({});
                    deepPick(resultObject[key][resultObject[key].length - 1], item, whitelistObject[key][0]);
                });
            }
            else if (_.isObject(whitelistObject[key]) && rawObject.hasOwnProperty(key)) {
                resultObject[key] = {};
                deepPick(resultObject[key], rawObject[key], whitelistObject[key]);
            }
            else
                resultObject[key] = rawObject[key];
        });
    };

    var getCacheKey = function (method, params, noCache) {
        var result;
        params = params || {};

        if (!!noCache)
            result = "";
        else {
            result = method;

            if (!!params) {
                var cacheParams = $.extend(true, {}, params);
                _.each(Consts.paramsToOmitFromCacheKey, function (param) {
                    delete cacheParams[param];
                });

                result += JSON.stringify(cacheParams);
            }
        }

        return result;
    };

    var makeRequest = function (endpointOrKey, params, httpMethod, format, options) {
        // Optional params.
        httpMethod = httpMethod || HttpMethod.Get;
        format = format || _m.options.format;
        options = options || {
            noCache: false, // true to prevent caching
            forceRefresh: false // true to repopulate the cache
        };
        params = getRequestParams(endpointOrKey, params);

        // Get endpoint.
        var endpoint = getEndpoint(endpointOrKey);
        var deferred = $.Deferred();
        var cacheKey = getCacheKey(endpoint.method, params, options.noCache);

        var cachedData = (!!options.noCache || !!options.forceRefresh) ?
            null :
            App.LocalStorage.get(cacheKey);

        if (!!cachedData)
            deferred.resolve(cachedData);
        else {
            var url = getUrl(endpoint.method, format);
            var request = $.ajax({
                url: url,
                dataType: format,
                data: params
            }).success(function (data, status) {
                if (status === "success") {
                    console.log("Raw: ", data);

                    data = getResult(endpointOrKey, data);

                    console.log("Reduced: ", data);

                    if (!options.noCache)
                        App.LocalStorage.set(cacheKey, data);

                    deferred.resolve(data, status);
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("Error calling " + endpoint.method, jqXHR.responseText);
                deferred.reject(jqXHR, textStatus, errorThrown);
            });
        }

        return deferred.promise();
    };

    var applyStoredParams = function (endpointOrKey, params) {
        var requiredParams = cloneParams(endpointOrKey).required;

        if (!!requiredParams) {
            _.each(_m.cachedParams, function (paramVal, paramKey) {
                if (!!paramVal && requiredParams.hasOwnProperty(paramKey))
                    params[paramKey] = paramVal;
            });
        }
    };

    var cleanupParams = function (params) {
        _.each(_.keys(params), function (key) {
            if (params[key] === "")
                delete params[key];
        });
    };

    var getUrl = function (method, format) {
        var result = _m.options.baseUrl + format + "/" + method;
        return result;
    };

    var cacheParams = function (params) {
        if (!!params)
            _.extend(_m.cachedParams, params);

        return _m.cachedParams;
    };

    var setOptions = function (options) {
        _.extend(_m.options, options);
    };

    var init = function () {
        setOptions(defaults);
    };

    init();

    return {
        Enums: Enums,
        setOptions: setOptions,
        getInterface: function () { return _.clone(endpoints); },
        cloneParams: cloneParams,
        cacheParams: cacheParams,
        login: login,
        isLoggedIn: isLoggedIn,
        getRequestParams: getRequestParams,
        makeRequest: makeRequest,
        getEndpoint: getEndpoint,
        getCacheKey: getCacheKey,
        deepPick: deepPick // Maybe a util
    };

})($, _);
