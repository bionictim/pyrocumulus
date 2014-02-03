App.FileList = (function (jquery, underscore, ejs) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var EJS = ejs;

    var Consts = {
        viewName: "fileList"
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

    var init = function (containerId) {
        _m.containerSelector = "#" + containerId;
        _m.$container = $(_m.containerSelector);
        bindEventsOnce();
    };

    var render = function (model) {
        if (model) {
            _m.model = model;
            var html = App.View.render(Consts.viewName, model);
            _m.$container.html(html);

            window.scrollTo(1);
            _.defer(function () { handleResize(); });

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

            if (model.parentDirectoryViewModel instanceof App.ViewModel.AlbumDirectoryViewModel) {
                var thumbnailFile = model.getThumbnail("large");
                if (!!thumbnailFile) {
                    var thumbId = !!thumbnailFile ? thumbnailFile.file.fileid : "";
                    var url = Pogoplug.getFileStreamUrl(thumbId);

                    if (!!url) {
                        _m.$container.find(".list-section").css({
                            background: App.Utils.formatBackgroundImageCss(url),
                            "background-size": "cover",
                            "background-repeat": "no-repeat",
                            "background-position": "center top"
                        });
                    }

                    _m.$container.find(".mask").show();
                }
            } else {
                _m.$container.find(".mask").hide();
            }
        }
    };

    var bindEventsOnce = function () {
        _m.$container.on("click", "a[data-command]", function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            var command = $target.data("command");
            var $item = $target.closest(".file-info");
            var itemData = $item.data();

            commands[command](itemData);
        });
    };

    var handleResize = function () {
        var toolbarHeight = _m.$container.find(".toolbar").outerHeight(true);
        var $listSection = _m.$container.find(".list-section");
        $listSection.css("margin-top", toolbarHeight + "px");
    };

    var commands = {
        select: function (itemData) {
            // Probably not used.
            callbacks.itemSelected({
                fileid: itemData.fileid
            });

            if (itemData.type == Pogoplug.Enums.FileType.directory) {
                App.ViewModel.FileListViewModel.load(itemData.fileid).then(function (viewModel) {
                    render(viewModel);
                    App.LocalStorage.set(App.LocalStorage.Keys.currentDirectory, { fileid: itemData.fileid });
                });
            }
        },
        play: function (itemData) {
            App.Player.playSong(itemData.fileid);
        },
        addSong: function (itemData) {
            App.Player.addSong(itemData.fileid);
        },
        playAll: function () {
            getAllSongs().then(function (fileids) {
                App.Player.addAllAndPlayFirst(fileids);
            });
        },
        addAll: function () {
            getAllSongs().then(function (fileids) {
                App.Player.addAll(fileids);
            });
        },
        shuffleAll: function () {
            getAllSongs().then(function (fileids) {
                App.Player.shuffleAllAndPlayFirst(fileids);
            });
        }
    };

    var getAllSongs = function () {
        var deferred = $.Deferred();

        var result = App.ViewModel.FileListViewModel.getFileIds(_m.model.songs);
        var albumPromises = [];

        _m.model.albumDirectories.forEach(function (albumViewModel) {
            albumPromises.push(App.ViewModel.FileListViewModel.load(albumViewModel.file.fileid));
        });

        $.whenall(albumPromises).done(function (fileListVMPromisResults) {
            var fileListVMResults = App.ViewModel.getArrayResult(fileListVMPromisResults);
            fileListVMResults.forEach(function (fileListViewModel) {
                var songFileids = App.ViewModel.FileListViewModel.getFileIds(fileListViewModel.songs);
                result = result.concat(songFileids);
            });
            deferred.resolve(result);
        });

        return deferred.promise();
    };

    return {
        setCallback: setCallback,
        init: init,
        render: render,
        handleResize: handleResize,
        getModel: function () { return _m.model; }
    };

})($, _, EJS);