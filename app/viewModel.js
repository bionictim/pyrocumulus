App.ViewModel = (function (jquery, underscore) {
    var $ = jquery;
    var _ = underscore;

    $.whenall = function (arr) {
        return $.when.apply($, arr).pipe(function () {
            return Array.prototype.slice.call(arguments);
        });
    };

    var getResult = function (promiseResult) {
        return (promiseResult instanceof Array) ? promiseResult[0] : promiseResult;
    };

    var getArrayResult = function (promiseResultArray) {
        var result = [];
        promiseResultArray.forEach(function (promiseResult) {
            result.push(getResult(promiseResult));
        });

        return result;
    };

    // ==== ViewModelBase ===========================

    var ViewModelBase = App.Class.define(function () {}, {
        loaded: function () {
            //console.log("ViewModel: ", this);
            $(this).trigger("onloaded");
        }
    });

    return {
        ViewModelBase: ViewModelBase,
        getResult: getResult,
        getArrayResult: getArrayResult
    };

})($, _);