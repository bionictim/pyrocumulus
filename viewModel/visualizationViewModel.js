(function (jquery, underscore, repository, pogoplug) {
    var $ = jquery;
    var _ = underscore;
    var repository = repository;
    var Pogoplug = pogoplug;

    var VisualizationViewModel = App.Class.derive(App.ViewModel.ViewModelBase,
        function (songViewModel, parentDirectoryViewModel, fileListViewModel) {
            this.song = songViewModel;
            this.directory = parentDirectoryViewModel;
            this.fileList = fileListViewModel;
            this.images = this.getImageList();
        }, {
            getImageList: function () {
                var result = this.fileList.images.slice(0); // Clone
                if (result.length > 1) {
                    result = _.reject(result, function (image) {
                        return image.displayName.substr("small") >= 0;
                    });
                }

                return result;
            }
        }, {
            load: function (songFileId) {
                var song;
                var directory;

                return App.ViewModel.FileViewModel.load(songFileId)
                    .then(function (songViewModel, parentDirectoryViewModel) {
                        song = songViewModel;
                        directory = parentDirectoryViewModel;

                        return App.ViewModel.FileListViewModel.load(directory.file.fileid);
                    }).then(function (fileListViewModel) {
                        var model = {
                            song: song,
                            directory: directory,
                            fileList: fileListViewModel
                        };

                        return new App.ViewModel.VisualizationViewModel(song, directory, fileListViewModel);                  
                    });
            }
        }
    );

    App.ViewModel.VisualizationViewModel = VisualizationViewModel;

})($, _, App.Repository, Pogoplug);