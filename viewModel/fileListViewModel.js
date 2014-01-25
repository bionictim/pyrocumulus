(function (jquery, underscore, repository, pogoplug) {
    var $ = jquery;
    var _ = underscore;
    var repository = repository;
    var Pogoplug = pogoplug;

    var FileListViewModel = App.Class.derive(App.ViewModel.ViewModelBase,
        function (parentDirectory, files) {
            this.parentDirectory = parentDirectory || null;
            this.files = files || [];
            this.genreDirectories=[]
            this.albumDirectories= [],
            this.otherDirectories= [],
            this.songs=[],
            this.images= [],
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

                    //var fileType = App.ViewModel.FileViewModel.getFileType(file);
                    //self[listMap[fileType]].push(file);
                });
            },

            getThumbnail: function () {
                var result = null;

                if (!!this.images) {
                    for (var i = 0, len = this.images.length; i < len; i++) {
                        // TODO: Get the right image.
                        // TODO: optimize, repository?
                        result = this.images[i];
                        break;
                    }
                }

                return result;
            }
        }, {
            load: function (directoryFileId) {
                var deferred = $.Deferred();
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
                        var result = new FileListViewModel(parentDirectory, fileResults);
                        result.loaded();
                        deferred.resolve(result);
                    });
                });

                return deferred.promise();
            },

            getThumbnail: function (imageFiles) {
                return !!imageFiles && imageFiles.length > 0 ? imageFiles[0] : null;

                //var result = null;
                //var imageFiles = [];
                //for (var i = 0, len = files.length; i < len; i++) {
                //    // TODO: Optimize.
                //    var fileType = App.ViewModel.FileViewModel.getFileType(files[0]);
                //    if (fileType === App.ViewModel.FileListViewModel.FileType.image)
                //        imageFiles.push(files[0]);
                //}

                //// TODO: Get the right one.
                //if (imageFiles.length > 0)
                //    result = imageFiles[0];

                //return result;
            }
        }
    );

    App.ViewModel.FileListViewModel = FileListViewModel;

})($, _, App.Repository, Pogoplug);