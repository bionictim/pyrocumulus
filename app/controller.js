App.Controller = (function (jquery, underscore) {
    "use strict";

    var $ = jquery;
    var _ = underscore;

    var Consts = {
        templateBaseUri: "/templates/",
        version: "1"
    };

    var _m = {
        version: ""
    };

    var getTemplateUri = function (viewName) {
        return Consts.templateBaseUri + viewName + ".html?__v=" + _m.version;
    };

    var render = function (viewName, model) {
        var result = new EJS({
            url: getTemplateUri(viewName)
        }).render(model);

        return result;
    };

    var init = function (version) {
        _m.version = version;
    };

    return {
        init: init,
        getTemplateUri: getTemplateUri,
        render: render
    };
})($, _);