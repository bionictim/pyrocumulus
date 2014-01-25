App.Player = (function (jquery, underscore, ejs) {
    "use strict";

    var $ = jquery;
    var _ = underscore;
    var EJS = ejs;

    var Consts = {
        viewName: "player"
    };

    var _m = {
        model: null, // App.ViewModel.FileListViewModel
        containerSelector: "",
        $container: null,
        $nowPlaying: null, // TODO: Something nicer.
        audio: null,
        songList: [],
        currentSongIndex: 0
    };

    var render = function (model) {
        if (model) {
            // Boilerplate.
            _m.model = model;
            var html = App.View.render(Consts.viewName, model);
            _m.$container.html(html);

            _m.audio = _m.$container.find("audio")[0];
            _m.audio.addEventListener("error", handlers.audioEvent, false);
            _m.audio.addEventListener("ended", handlers.audioEvent, false);

            _m.$nowPlaying = _m.$container.find("#nowPlaying");
        }
    };

    var bindEventsOnce = function () {
        _m.$container.on("click", ".controls a[data-command]", function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            var command = $target.data("command");

            audioCommands[command]();
        });
    };

    var handlers = {
        audioEvent: function (e) {
            // if the list is still true (ie not at the end of the list)
            // step to the next item either on ended or error
            if (_m.currentSongIndex < _m.songList.length) {
                _m.currentSongIndex++;
                loadSong();
                audioCommands.play();
            } else {
                // action to indicate end of stream    
            }
        }
    };

    var audioCommands = {
        play: function () {
            _m.audio.play();
        },
        pause: function () {
            _m.audio.pause();
            clearSong();
        },
        previous: function () {
            if (_m.currentSongIndex > 0)
                _m.currentSongIndex--;

            loadSong();
            audioCommands.play();
        },
        next: function () {
            if (_m.currentSongIndex < _m.songList.length - 1)
                _m.currentSongIndex++;

            loadSong();
            audioCommands.play();
        }
    };

    var loadSong = function (index) {
        index = index || _m.currentSongIndex;

        if (index >= _m.songList.length) {
            return false;
        } else {
            _m.audio.autoplay = false;
            _m.audio.src = Pogoplug.getFileStreamUrl(_m.songList[index]);

            App.ViewModel.FileViewModel.load(_m.songList[index]).then(function (fileViewModel, parentDirectoryViewModel) {
                updateNowPlaying(fileViewModel, parentDirectoryViewModel);
            });

            return true;
        }
    };

    var playSong = function (fileid) {
        clearSong();
        _m.songList.push(fileid);
        _m.currentSongIndex = _m.songList.length - 1;
        loadSong();
        //_m.audio.src = url;
        audioCommands.play();
    };

    var addAndPlayFirst = function (fileids) {
        _m.songList = _m.songList.concat(fileids);
        _m.currentSongIndex = _m.songList.length - fileids.length;
        loadSong();
        audioCommands.play();
    };

    var clearSong = function () {
        _m.audio.src = "";
        // or
        _m.audio.removeAttribute("src");
    };

    var clearSongList = function () {
        _m.songList = [];
    };

    // TODO: Something nicer.
    var updateNowPlaying = function (songViewModel, parentDirectoryViewModel) {
        _m.$nowPlaying.find("[data-bind]").each(function (i, el) {
            var $el = $(el);
            var prop = $el.data("bind");
            var val = songViewModel[prop];
            $el.html(val);
        })
    };

    var init = function (containerId) {
        _m.containerSelector = "#" + containerId;
        _m.$container = $(_m.containerSelector);
        bindEventsOnce();

        render({});
    };

    return {
        init: init,
        playSong: playSong,
        addAndPlayFirst: addAndPlayFirst
    };
})($, _, EJS);