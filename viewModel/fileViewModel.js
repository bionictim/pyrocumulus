(function (jquery, underscore, repository, pogoplug) {
    var $ = jquery;
    var _ = underscore;
    var repository = repository;
    var Pogoplug = pogoplug;

    var FileViewModel = App.Class.derive(App.ViewModel.ViewModelBase,
        function (file) {
            this.file = file;
        }, {
            displayName: ""
        }, {
            FileType: {
                genreDirectory: "genreDirectory",
                albumDirectory: "albumDirectory",
                otherDirectory: "otherDirectory",
                song: "song",
                image: "image",
                otherFile: "other"
            },

            getFileType: function (file) {
                var result;

                if (file.type === Pogoplug.Enums.FileType.directory) {
                    if (file.filename.substr(0, 1) === "_") {
                        if (file.filename.substr(0, 2) === "__")
                            result = FileViewModel.FileType.otherDirectory;
                        else
                            result = FileViewModel.FileType.genreDirectory;
                    } else {
                        result = FileViewModel.FileType.albumDirectory;
                    }
                } else if (file.type === Pogoplug.Enums.FileType.file) {
                    var audioPrefix = "audio";
                    var imagePrefix = "image";

                    if (file.mimetype.substr(0, audioPrefix.length) === audioPrefix)
                        result = FileViewModel.FileType.song;
                    else if (file.mimetype.substr(0, imagePrefix.length) === imagePrefix)
                        result = FileViewModel.FileType.image;
                    else
                        result = FileViewModel.FileType.otherFile;
                } else {
                    throw "Unsupported file.type";
                }

                return result;
            },

            getDirectoryInfo: function (directoryName) {
                var artistPlus = directoryName.split(" - ");
                var artist = artistPlus[0];
                var album = null;
                var meta = [];

                try {
                    if (artistPlus.length > 1) {
                        var albumPlus = artistPlus[1].split(" [");
                        album = albumPlus[0];

                        if (albumPlus.length > 1) {
                            meta = albumPlus[1].split("]")[0].split(",");
                            $.each(meta, function (i) {
                                meta[i] = meta[i].trim();
                            });
                        }

                        var the = ", the";
                        if (artist.toLowerCase().endsWith(the))
                            artist = "The " + artist.substring(0, artist.length - the.length);
                    }
                } catch (err) { }

                return {
                    artist: artist,
                    album: album,
                    meta: meta
                };
            },

            getSongInfo: function (fileName, artistName, albumName) {
                var trackNumber = null;
                var songName = fileName;

                if (fileName.lastIndexOf("-") == fileName.length - 4)
                    fileName = songName.substring(0, fileName.length - 4).trim();

                var parts = fileName.split(" ");

                try {
                    if (parts[0].isNumeric()) {
                        trackNumber = parts[0];
                        parts.shift();
                        fileName = parts.join(" ");
                    }

                    var file = fileName.replace(artistName, "-");
                    file = file.replace(albumName, "-");
                    parts = file.split("-");
                    var parts2 = [];

                    for (i = 0; i < parts.length; i++) {
                        var s = parts[i].trim();

                        if (s.isNumeric() && trackNumber == null)
                            trackNumber = s;
                        else if (s != "")
                            parts2.push(s);
                    }

                    if (parts2.length == 0)
                        songName = albumName;
                    else
                        songName = parts2.join(" - ");
                } catch (err) { }

                return {
                    songName: songName,
                    trackNumber: trackNumber
                };
            },

            load: function (file) {
                var deferred = $.Deferred();
                var fileType = FileViewModel.getFileType(file);

                if (fileType === FileViewModel.FileType.albumDirectory) {

                } else {

                }

                return deferred.promise();
            }
        }
    );

    var DirectoryViewModel = App.Class.derive(App.ViewModel.ViewModelBase, function () { }, {
        loadThumbnail: function () {
            var deferred = $.Deferred();

            

            return deferred.promise();
        }
    });

    var GenreDirectoryViewModel = App.Class.derive(DirectoryViewModel, function () { });
    var AlbumDirectoryViewModel = App.Class.derive(DirectoryViewModel, function () { });
    var SongViewModel = App.Class.derive(FileViewModel, function () { });

    App.ViewModel.FileViewModel = FileViewModel;
    App.ViewModel.DirectoryViewModel = DirectoryViewModel;
    App.ViewModel.GenreDirectoryViewModel = GenreDirectoryViewModel;
    App.ViewModel.AlbumDirectoryViewModel = AlbumDirectoryViewModel;
    App.ViewModel.SongViewModel = SongViewModel;

})($, _, App.Repository, Pogoplug);