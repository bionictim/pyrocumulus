(function (jquery, underscore, repository, pogoplug) {
    var $ = jquery;
    var _ = underscore;
    var repository = repository;
    var Pogoplug = pogoplug;

    var FileListViewModel = App.Class.derive(App.ViewModel.ViewModelBase,
        function (parentDirectory, files) {
            this.parentDirectory = parentDirectory || null;
            this.files = files || [];
            this.genreDirectories = []
            this.albumDirectories = [],
            this.otherDirectories = [],
            this.songs = [],
            this.images = [],
            this.otherFiles = []
            this.parentDirectoryViewModel = App.ViewModel.FileViewModel.create(parentDirectory);
            this._loadLists();
        }, {
            _loadLists: function () {
                var listMap = {};
                var T = App.ViewModel.FileViewModel.FileType;
                listMap[T.genreDirectory] = "genreDirectories";
                listMap[T.albumDirectory] = "albumDirectories";
                listMap[T.otherDirectory] = "otherDirectories";
                listMap[T.song] = "songs";
                listMap[T.image] = "images";
                listMap[T.otherFile] = "otherFiles";

                var self = this;
                this.files.forEach(function (file) {
                    var fileViewModel = App.ViewModel.FileViewModel.create(file, self.parentDirectoryViewModel);
                    self[listMap[fileViewModel.fileType]].push(fileViewModel);
                });
            },

            getThumbnail: function (size) {
                size = size || "small";
                var result = null;

                result = App.Cache.get(App.Cache.stores.thumbnails, this.parentDirectory.fileid);

                if (!result) {
                    var candidates = [];
                    var bestCandidates = [];

                    if (!!this.images && this.images.length > 0) {
                        for (var i = 0, len = this.images.length; i < len; i++) {
                            // TODO: Get the right image.
                            // TODO: optimize, repository?
                            if (size === "small") {
                                result = this.images[i];
                                break;
                            } else {
                                var filename = this.images[i].file.filename.toLowerCase();
                                if (size === "large") {
                                    if (filename.substr("small") < 0 && filename.substr("back") < 0) {
                                        if (filename.substr("cover") >= 0)
                                            bestCandidates.push(this.images[i]);
                                        else
                                            candidates.push(this.images[i]);
                                    }
                                }
                            }
                        }

                        if (!result)
                            result = this.images[0];
                    }

                    App.Cache.set(App.Cache.stores.thumbnails, this.parentDirectory.fileid, result);
                }

                return result;
            }
        }, {
            load: function (directoryFileId) {
                var deferred = $.Deferred();
                var result;

                result = App.Cache.get(App.Cache.stores.fileListViewModels, directoryFileId);

                if (!!result) {
                    deferred.resolve(result);
                } else {
                    var promises = [
                        repository.getFile(directoryFileId),
                        repository.getFiles(directoryFileId)
                    ];

                    $.whenall(promises).done(function (resultsArr) {
                        var parentDirectory = App.ViewModel.getResult(resultsArr[0]);
                        var fileList = App.ViewModel.getResult(resultsArr[1]);

                        var filePromises = [];
                        fileList.files.forEach(function (file) {
                            filePromises.push(repository.getFile(file.fileid));
                        });

                        $.whenall(filePromises).done(function (filePromiseResults) {
                            var fileResults = App.ViewModel.getArrayResult(filePromiseResults);
                            result = new FileListViewModel(parentDirectory, fileResults);
                            result.loaded();
                            App.Cache.set(App.Cache.stores.fileListViewModels, directoryFileId, result);

                            deferred.resolve(result);
                        });
                    });
                }

                return deferred.promise();
            },

            //getThumbnail: function (imageFiles) {
            //    // Is this used?
            //    return !!imageFiles && imageFiles.length > 0 ? imageFiles[0] : null;

            //    //var result = null;
            //    //var imageFiles = [];
            //    //for (var i = 0, len = files.length; i < len; i++) {
            //    //    // TODO: Optimize.
            //    //    var fileType = App.ViewModel.FileViewModel.getFileType(files[0]);
            //    //    if (fileType === App.ViewModel.FileListViewModel.FileType.image)
            //    //        imageFiles.push(files[0]);
            //    //}

            //    //// TODO: Get the right one.
            //    //if (imageFiles.length > 0)
            //    //    result = imageFiles[0];

            //    //return result;
            //},

            getFileIds: function (fileViewModelList) {
                var result = [];
                fileViewModelList.forEach(function (fileViewModel) {
                    result.push(fileViewModel.file.fileid);
                });
                return result;
            }
        }
    );

    App.ViewModel.FileListViewModel = FileListViewModel;

})($, _, App.Repository, Pogoplug);