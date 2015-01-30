App.Player = (function (jquery, underscore) {
    "use strict";

    var $ = jquery;
    var _ = underscore;

    var Consts = {
        queuePageSize: 50
    };

    var _m = {
        $positioner: null,
        $drawer: null,
        $nowPlaying: null, // TODO: Something nicer.
        $queue: null,
        audio: null,
        songList: [],
        currentSongIndex: 0,
        currentQueuePage: 0,
        hasScrolledQueue: false
    };

    var commands = {
        play: function () {
            _m.audio.play();
        },
        stop: function () {
            _m.audio.pause();
            clearSong();
        },
        previous: function () {
            if (_m.currentSongIndex > 0)
                _m.currentSongIndex--;

            loadSong();
            commands.play();
        },
        next: function () {
            if (_m.currentSongIndex < _m.songList.length - 1)
                _m.currentSongIndex++;

            loadSong();
            commands.play();
        },
        toggleVisibility: function (forceState) {
            if (forceState === true || (forceState !== false && _m.$drawer.hasClass("collapsed"))) {
                _m.$drawer.removeClass("collapsed");
                _m.$drawer.css({ bottom: 0 + "px" });
            } else {
                var height = _m.$drawer.outerHeight();
                _m.$drawer.css({ bottom: "-" + height + "px" });
                _m.$drawer.addClass("collapsed");
            }
        },
        clearQueue: function () {
            commands.stop();
            _m.songList = [];
            _m.currentQueuePage = 0;
            _m.$nowPlaying.find(".current-song-info").hide(); // TODO: Something better.
            renderQueue().done();
        },
        shuffleQueue: function () {
            commands.stop();
            if (_m.songList.length > 0) {
                App.Utils.shuffle(_m.songList);
                _m.currentSongIndex = 0;
            }
            _m.currentQueuePage = 0;
            renderQueue().done();
        },
        select: function (e) {
            var $item = $(e.currentTarget).closest(".item");
            var fileid = $item.data("fileid");
            loadSong(_m.songList.indexOf(fileid));
            commands.play();
        }
    };

    var handlers = {
        audioEvent: function (e) {
            // if the list is still true (ie not at the end of the list)
            // step to the next item either on ended or error
            if (_m.currentSongIndex < _m.songList.length) {
                _m.currentSongIndex++;
                loadSong();
                commands.play();
            } else {
                // action to indicate end of stream    
            }
        }
    };

    var loadSong = function (index) {
        if (typeof index === "undefined" || index === null)
            index = _m.currentSongIndex;

        _m.currentSongIndex = index;

        if (index >= _m.songList.length) {
            return false;
        } else {
            _m.audio.autoplay = false;
            _m.audio.src = Pogoplug.getFileStreamUrl(_m.songList[index]);

            App.ViewModel.FileViewModel.load(_m.songList[index]).then(function (fileViewModel, parentDirectoryViewModel) {
                updateNowPlaying(fileViewModel);
            });

            return true;
        }
    };

    var clearSong = function () {
        _m.audio.src = "";
        // or
        _m.audio.removeAttribute("src");
    };

    var getSongListPage = function () {
        var beginIndex = _m.currentQueuePage * Consts.queuePageSize;
        var endIndex = (_m.currentQueuePage + 1) * Consts.queuePageSize;
        var result = _m.songList.slice(beginIndex, endIndex);

        return result;
    };

    var renderQueue = function () {
        var deferred = $.Deferred();

        _m.hasScrolledQueue = false;

        var fileVMPromises = [];
        var songListPage = getSongListPage();

        songListPage.forEach(function (fileid) {
            fileVMPromises.push(App.ViewModel.FileViewModel.load(fileid));
        });

        $.whenall(fileVMPromises).done(function (fileVMPromiseResults) {
            // This is lame, but it should be an array of two return args (2-item arr), but if only one promise, the result is one 2-item arr.
            // TODO: Improve $.whenall
            fileVMPromiseResults = fileVMPromises.length === 1 ? [fileVMPromiseResults] : fileVMPromiseResults;

            var fileResults = App.ViewModel.getArrayResult(fileVMPromiseResults);
            _m.$queue.html(App.View.render("itemList", { list: fileResults }));

            var itemWidth = _m.$queue.find(".item").first().outerWidth(true);
            var paddingAfterLast = 20; // Should probably match CSS.
            _m.$queue.find(".list").width(itemWidth * fileResults.length + paddingAfterLast);

            selectCurrentSong();

            fileVMPromiseResults.forEach(function (fileVMPromiseResult) {
                var songViewModel = fileVMPromiseResult[0];
                var directoryViewModel = fileVMPromiseResult[1];

                App.ViewModel.FileListViewModel.load(songViewModel.file.parentid).then(function (fileListViewModel) {
                    var thumbnailFile = fileListViewModel.getThumbnail();
                    if (!!thumbnailFile) {
                        var thumbId = !!thumbnailFile ? thumbnailFile.file.thumbnail || thumbnailFile.file.fileid : "";
                        var url = Pogoplug.getFileStreamUrl(thumbId);

                        if (!!url) {
                            var $item = _m.$queue
                                .find(".item[data-fileid='" + songViewModel.file.fileid + "'] .image-container")
                                .css("background-image", App.Utils.formatBackgroundImageCss(url));
                        }
                    }
                });
            });

            deferred.resolve();
        });

        return deferred.promise();
    };

    var renderNextQueuePage = function () {
        var currentPage = _m.currentQueuePage;
        _m.currentQueuePage = Math.min(_m.currentQueuePage + 1, getQueuePage(_m.songList.length - 1));

        if (currentPage !== _m.currentQueuePage)
            renderQueue();
    };

    var renderPreviousQueuePage = function () {
        var currentPage = _m.currentQueuePage;
        _m.currentQueuePage = Math.max(_m.currentQueuePage - 1, getQueuePage(0));

        if (currentPage !== _m.currentQueuePage)
            renderQueue().then(function () {
                _.defer(function () {
                    _m.$queue.scrollLeft(_m.$queue[0].scrollWidth);
                });
            });
    };

    var getQueuePage = function (songIndex) {
        return Math.floor(songIndex / Consts.queuePageSize);
    };

    var updateNowPlaying = function (songViewModel) {
        var updateUI = function () {
            // TODO: A view?
            var $songInfo = _m.$nowPlaying.find(".current-song-info");
            _m.$nowPlaying.find("[data-bind]").each(function (i, el) {
                var $el = $(el);
                var prop = $el.data("bind");
                var val = songViewModel[prop];
                $el.html(val);
            });
            $songInfo.show(); // TODO: Something better.

            // HACK to get song info P tag to size to fit.
            $songInfo.width($songInfo.width() + "px");
            _.defer(function () { $songInfo.css("width", ""); });

            selectCurrentSong();
        }

        var currentSongsQueuePage = getQueuePage(_m.currentSongIndex);
        if (currentSongsQueuePage !== _m.currentQueuePage) {
            _m.currentQueuePage = currentSongsQueuePage;
            renderQueue().then(function () {
                updateUI();
            });
        } else {
            updateUI();
        }
    };

    var selectCurrentSong = function () {
        // Select current song in queue.
        _m.$queue.find(".selected").removeClass("selected");

        if (_m.currentQueuePage === getQueuePage(_m.currentSongIndex)) {
            var index = _m.currentSongIndex % Consts.queuePageSize;
            var $item = _m.$queue.find(".item").eq(index);
            $item.addClass("selected");
            $item[0].scrollIntoView();
        }
    };

   var options = {

        viewName: "player",

        afterInit: function () {
            this.render({});
        },

        afterRender: function () {
            _m.audio = this.$container.find("audio")[0];
            _m.audio.addEventListener("error", handlers.audioEvent, false);
            _m.audio.addEventListener("ended", handlers.audioEvent, false);

            _m.$positioner = this.$container.find(".positioner");
            _m.$drawer = this.$container.find(".drawer");
            _m.$nowPlaying = this.$container.find("#nowPlaying");
            _m.$queue = this.$container.find(".song-queue");
            this.handleResize();
            commands.toggleVisibility(false);

            // TODO: Optimize
            _m.$queue.bind('scroll', function () {
                var $scroller = $(this);
                var scrollLeft = $scroller.scrollLeft();

                if (scrollLeft > 0)
                    _m.hasScrolledQueue = true;

                if (scrollLeft === 0 && _m.hasScrolledQueue) {
                    renderPreviousQueuePage();
                } else if (scrollLeft + $scroller.innerWidth() >= $scroller[0].scrollWidth) {
                    renderNextQueuePage();
                }
            });

            _m.$queue.bind('mousewheel', function (e, delta) {
                e.preventDefault();
                var wheelEvent = e.originalEvent;
                _m.$queue[0].scrollLeft += wheelEvent.deltaY;

            });
        },

        bindEventsOnce: function () {
            this.$container.on("click", "a[data-command]", function (e) {
                e.preventDefault();
                var $target = $(e.currentTarget);
                var command = $target.data("command");

                commands[command](e);
            });
        },

        handleResize: function () {
            var winHeight = $(window).height();
            _m.$positioner.css({
                height: winHeight + "px"
            });
            //var $drawer = $(".drawer");
            //var pos = $drawer.position();
            //var pospos = _m.$positioner.position();
            //App.Utils.Debug.write("w:" + winHeight + ",d:" + $drawer.height() + "," + $drawer.is(":visible") + ";" + pos.left + "," + pos.top + ";" + pospos.left + "," + pospos.top + "b:" + $drawer.css("bottom"));
        },

        playSong: function (fileid) {
            clearSong();
            _m.songList.push(fileid);
            renderQueue().then(function () {
                _m.currentSongIndex = _m.songList.length - 1;
                loadSong();
                commands.play();
            });
        },

        addSong: function (fileid) {
            _m.songList.push(fileid);
            renderQueue().done();
        },

        addAllAndPlayFirst: function (fileids, shuffle) {
            _m.songList = _m.songList.concat(fileids);

            if (!!shuffle)
                commands.shuffleQueue();

            renderQueue().then(function () {
                _m.currentSongIndex = _m.songList.length - fileids.length;
                loadSong();
                commands.play();
                commands.toggleVisibility(true);
            });
        },

        shuffleAllAndPlayFirst: function (fileids) {
            this.addAllAndPlayFirst(fileids, true);
        },

        addAll: function (fileids) {
            _m.songList = _m.songList.concat(fileids);
            renderQueue().then(function () {
                commands.toggleVisibility(true);
            });
        }
    };

    return new App.Controller(options);

})($, _);