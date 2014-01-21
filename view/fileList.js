App.FileList = (function (jquery, underscore, ejs) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var EJS = ejs;

    var Consts = {
        viewName: "fileList"
    };

    var _m = {
        model: null,
        containerSelector: "",
        $container: null
    };

    var callbacks = {
        itemSelected: function (fileid) { }
    };

    var setCallback = function (name, callback) {
        callbacks[name] = callback;
    };

    var render = function (model) {
        if (model) {
            _m.model = model;
            var html = App.Controller.render(Consts.viewName, model);
            _m.$container.html(html);
        }
    };

    var bindEventsOnce = function () {
        _m.$container.on("click", "li a, a.navigate", function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            var $item = $target.hasClass("navigate") ? $target : $target.parent();
            var itemData = $item.data();

            callbacks.itemSelected({
                fileid: itemData.fileid
            });

            if (itemData.type == Pogoplug.Enums.FileType.directory) {
                App.Repository.getFiles(itemData.fileid).then(function (data, status) {
                    render({
                        parentid: itemData.fileid,
                        files: data
                    });
                });
            }
        });
    };

    var init = function (containerId) {
        _m.containerSelector = "#" + containerId;
        _m.$container = $(_m.containerSelector);
        bindEventsOnce();
    };

    return {
        setCallback: setCallback,
        init: init,
        render: render,
        getModel: function () { return _m.model; }
    };

})($, _, EJS);