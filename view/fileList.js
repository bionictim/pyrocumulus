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
        itemSelected: function (fileid) { } // Probably not used.
    };

    var setCallback = function (name, callback) {
        callbacks[name] = callback;
    };

    var render = function (model) {
        if (model) {
            _m.model = model;
            var html = App.View.render(Consts.viewName, model);
            _m.$container.html(html);

            model.albumDirectories.forEach(function (dir) {
                App.ViewModel.FileListViewModel.load(dir.file.fileid).then(function (viewModel) {
                    var thumbnailFile = viewModel.getThumbnail();
                    if (!!thumbnailFile) {
                        var thumbId = !!thumbnailFile ? thumbnailFile.file.thumbnail || thumbnailFile.file.fileid : "";
                        var url = Pogoplug.getFileStreamUrl(thumbId);

                        if (!!url) {
                            var $item = _m.$container
                                .find(".item[data-fileid='" + dir.file.fileid + "'] .image-container")
                                .css("background-image", App.Utils.formatBackgroundImageCss(url));
                        }
                    }
                });
            });
        }
    };

    var bindEventsOnce = function () {
        _m.$container.on("click", "a[data-command]", function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            var command = $target.data("command");
            var $item = $target.closest(".file-info");
            var itemData = $item.data();

            itemCommands[command](itemData);
        });
    };

    var itemCommands = {
        select: function (itemData) {
            // Probably not used.
            callbacks.itemSelected({
                fileid: itemData.fileid
            });

            if (itemData.type == Pogoplug.Enums.FileType.directory) {
                App.ViewModel.FileListViewModel.load(itemData.fileid).then(function (viewModel) {
                    render(viewModel);
                });
            }
        },
        play: function (itemData) {
            App.Player.playSong(itemData.fileid);
        },
        playAll: function () {
            var fileids = _.pluck(_m.model.files, "fileid");
            App.Player.addAndPlayFirst(fileids);
        }
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