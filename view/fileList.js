App.FileList = (function (jquery, underscore, ejs) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var EJS = ejs;

    var Consts = {
        viewName: "fileListModule"
    };

    var _m = {
        model: null, // App.ViewModel.FileListViewModel
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
            var html = App.View.render(Consts.viewName, model);
            _m.$container.html(html);

            model.albumDirectories.forEach(function (file) {
                App.ViewModel.FileListViewModel.load(file.fileid).then(function (viewModel) {
                    var thumbnailFile = viewModel.getThumbnail();
                    if (!!thumbnailFile) {
                        var thumbId = !!thumbnailFile ? thumbnailFile.thumbnail || thumbnailFile.fileid : "";
                        var url = Pogoplug.getFileStreamUrl(thumbId);

                        if (!!url) {
                            var $item = _m.$container
                                .find(".item[data-fileid='" + file.fileid + "'] .image-container")
                                .css("background-image", App.Utils.formatBackgroundImageCss(url));
                        }
                    }
                });
            });
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
                App.ViewModel.FileListViewModel.load(itemData.fileid).then(function (viewModel) {
                    render(viewModel);
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