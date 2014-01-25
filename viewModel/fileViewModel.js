(function (jquery, underscore, repository, pogoplug) {
    var $ = jquery;
    var _ = underscore;
    var repository = repository;
    var Pogoplug = pogoplug;

    var FileViewModel = App.Class.derive(App.ViewModel.ViewModelBase,
        function (file, fileType) {
            this.file = file;
            this.fileType = fileType || (!!file ? App.ViewModel.FileViewModel.getFileType(file) : null);

            if (!this.displayName && !!file)
                this.displayName = file.filename;                
        }, {
            displayName: ""
            //,
            //fileType: "" // FileViewModel.FileType
        }, {
            FileType: {
                genreDirectory: "genreDirectory",
                albumDirectory: "albumDirectory",
                otherDirectory: "otherDirectory",
                song: "song",
                image: "image",
                otherFile: "otherFile"
            },

            ClassFileTypeMap: {
                genreDirectory: "GenreDirectoryViewModel",
                albumDirectory: "AlbumDirectoryViewModel",
                otherDirectory: "DirectoryViewModel",
                song: "SongViewModel",
                image: "ImageViewModel",
                otherFile: "FileViewModel"
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

            getSongInfo: function (fileName, artistName, albumName) {
                var trackNumber;
                var songName;
                var extension;

                var cleanedFileName = fileName.replace(/_/g, " ");

                if (cleanedFileName.lastIndexOf("-") == cleanedFileName.length - 4)
                    cleanedFileName = songName.substring(0, cleanedFileName.length - 4).trim();

                var parts = cleanedFileName.split(" ");

                try {
                    if (parts[0].isNumeric()) {
                        trackNumber = parts[0];
                        parts.shift();
                        cleanedFileName = parts.join(" ");
                    }

                    var file = cleanedFileName.replace(artistName, "-");
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

                    var lastDotIndex = songName.lastIndexOf(".");
                    if (lastDotIndex !== -1) {
                        extension = songName.substr(lastDotIndex + 1);
                        songName = songName.substr(0, lastDotIndex);
                    }
                } catch (err) { }                

                return {
                    songName: songName,
                    trackNumber: trackNumber,
                    extension: extension
                };
            },

            load: function (fileid) {
                var deferred = $.Deferred();

                App.Repository.getFile(fileid).then(function (file) {
                    App.Repository.getFile(file.parentid).then(function (parent) {
                        var parentDirectoryViewModel = FileViewModel.create(parent);
                        var viewModel = FileViewModel.create(file, parentDirectoryViewModel);

                        deferred.resolve(viewModel, parentDirectoryViewModel);
                    });
                });

                return deferred.promise();
            },

            // param "file": Fully populated file
            create: function (file, parentDirectoryViewModel) {
                var fileType = App.ViewModel.FileViewModel.getFileType(file);
                var classType = App.ViewModel.FileViewModel.ClassFileTypeMap[fileType];
                var constructor = App.ViewModel[classType];

                return new constructor(file, fileType, parentDirectoryViewModel);                
            }
        }
    );

    var DirectoryViewModel = App.Class.derive(FileViewModel, function (file, fileType) {
        DirectoryViewModel.superproto.constructor.call(this, file, fileType || FileViewModel.FileType.directory);

        if (!!file) {
            var directoryInfo = DirectoryViewModel.getDirectoryInfo(file.filename);
            this.artist = directoryInfo.artist;
            this.album = directoryInfo.album;
            this.meta = directoryInfo.meta;
        }
    }, {
    }, {
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
        }
    });

    var GenreDirectoryViewModel = App.Class.derive(DirectoryViewModel, function (file, fileType) {
        GenreDirectoryViewModel.superproto.constructor.call(this, file, fileType || FileViewModel.FileType.genreDirectory);

        if (!!file)
            this.displayName = file.filename.substr(1);
    });

    var AlbumDirectoryViewModel = App.Class.derive(DirectoryViewModel, function (file, fileType) {
        AlbumDirectoryViewModel.superproto.constructor.call(this, file, fileType || FileViewModel.FileType.albumDirectory);
    });

    var SongViewModel = App.Class.derive(FileViewModel, function (file, fileType, parentDirectoryViewModel) {
        SongViewModel.superproto.constructor.call(this, file, fileType || FileViewModel.FileType.song);

        this.songName = "";
        this.trackNumber = "";

        if (!!parentDirectoryViewModel && this.file) {
            var songInfo = FileViewModel.getSongInfo(this.file.filename, parentDirectoryViewModel.artist, parentDirectoryViewModel.album);
            this.songName = songInfo.songName;
            this.trackNumber = songInfo.trackNumber;

            this.displayName = this.songName;

            this.artist = parentDirectoryViewModel.artist;
            this.album = parentDirectoryViewModel.album;
            this.meta = parentDirectoryViewModel.meta;
        }
    });

    var ImageViewModel = App.Class.derive(FileViewModel, function (file, fileType) {
        ImageViewModel.superproto.constructor.call(this, file, fileType || FileViewModel.FileType.image);
    });

    App.ViewModel.FileViewModel = FileViewModel;
    App.ViewModel.DirectoryViewModel = DirectoryViewModel;
    App.ViewModel.GenreDirectoryViewModel = GenreDirectoryViewModel;
    App.ViewModel.AlbumDirectoryViewModel = AlbumDirectoryViewModel;
    App.ViewModel.SongViewModel = SongViewModel;
    App.ViewModel.ImageViewModel = ImageViewModel;

})($, _, App.Repository, Pogoplug);