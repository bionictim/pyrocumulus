App.FileList = (function (jquery, underscore) {
    "use strict";

    var $ = jquery;
    var _ = underscore;

    var commands = {
        select: function (itemData) {
            var self = this;

            // Probably not used.
            controller.callbacks.itemSelected({
                fileid: itemData.fileid
            });

            if (itemData.type == Pogoplug.Enums.FileType.directory) {
                App.ViewModel.FileListViewModel.load(itemData.fileid).then(function (viewModel) {
                    controller.render(viewModel);
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

        var result = App.ViewModel.FileListViewModel.getFileIds(controller.model.songs);
        var albumPromises = [];

        controller.model.albumDirectories.forEach(function (albumViewModel) {
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

    var options = {

        viewName: "fileList",

        callbacks: {
            itemSelected: function (fileid) { } // Probably not used.
        },

        afterRender: function (model) {
            var self = this;

            window.scrollTo(1,0);
            _.defer(function () { self.handleResize(); });

            this.model.albumDirectories.forEach(function (dir) {
                App.ViewModel.FileListViewModel.load(dir.file.fileid).then(function (viewModel) {
                    var thumbnailFile = viewModel.getThumbnail();
                    if (!!thumbnailFile) {
                        var thumbId = !!thumbnailFile ? thumbnailFile.file.thumbnail || thumbnailFile.file.fileid : "";
                        var url = Pogoplug.getFileStreamUrl(thumbId);

                        if (!!url) {
                            var $item = self.$container
                                .find(".item[data-fileid='" + dir.file.fileid + "'] .image-container")
                                .css("background-image", App.Utils.formatBackgroundImageCss(url));
                        }
                    }
                });
            });

            if (this.model.parentDirectoryViewModel instanceof App.ViewModel.AlbumDirectoryViewModel) {
                var thumbnailFile = this.model.getThumbnail("large");
                if (!!thumbnailFile) {
                    // var thumbId = !!thumbnailFile ? thumbnailFile.file.fileid : "";
                    // var url = Pogoplug.getFileStreamUrl(thumbId);

                    var url = thumbnailFile.getUrl();

                    if (!!url) {
                        this.$container.find(".list-section").css({
                            background: App.Utils.formatBackgroundImageCss(url),
                            "background-size": "cover",
                            "background-repeat": "no-repeat",
                            "background-position": "center top"
                        });
                    }

                    this.$container.find(".mask").show();
                }
            } else {
                this.$container.find(".mask").hide();
            }
        },

        bindEventsOnce: function () {
            this.$container.on("click", "a[data-command]", function (e) {
                e.preventDefault();
                var $target = $(e.currentTarget);
                var command = $target.data("command");
                var $item = $target.closest(".file-info");
                var itemData = $item.data();

                commands[command](itemData);
            });
        },

        handleResize: function () {
            var padding = 30;
            var toolbarHeight = this.$container.find(".toolbar").outerHeight(true);
            var $firstList = this.$container.find(".list").first();
            $firstList.css("margin-top", (toolbarHeight + padding) + "px");
        }
    };

    var controller = new App.Controller(options);

    return controller;

})($, _);