App.Visualization = (function (jquery, underscore) {
    "use strict";

    var $ = jquery;
    var _ = underscore;

    var Consts = {
        slideTransitionLengthMs: 500,
        slideDisplayLengthMs: 5000,
        discSelector: "#visualization .visualization-image.slide.disc",
        resizeCss: "{disc-selector} { width: {size}px; height: {size}px; }"
    };

    var _m = {
        currentSlideIndex: -1,
        slideCount: 0,
        $slides: null,
        timeout: null,
        isShowing: false,
        isPaused: false
    };

    var commands = {
        close: function () {
            controller.stop();
            controller.$container.fadeOut();
            controller.callbacks.close();
        },

        start: function () {
            controller.start();
            controller.$container.toggleClass("paused");
        },

        stop: function () {
            controller.stop();
            controller.$container.toggleClass("paused");
        }
    };

    var _showNextSlide = function () {
        var $oldSlide;

        if (_m.currentSlideIndex >= 0)
            $oldSlide = _m.$slides.eq(_m.currentSlideIndex);

        _m.currentSlideIndex++;
        _m.currentSlideIndex = _m.currentSlideIndex % _m.slideCount;

        var $newSlide = _m.$slides.eq(_m.currentSlideIndex);

        if ($oldSlide)
            $oldSlide.fadeOut(Consts.slideTransitionLengthMs);

        $newSlide.fadeIn(Consts.slideTransitionLengthMs);
    };

    var _queueNext = function () {
        _m.timeout = setTimeout(function () {
            _showNextSlide();
            _queueNext();
        }, Consts.slideDisplayLengthMs);
    };

    var options = {

        viewName: "visualization",

        callbacks: {
            close: function () { }
        },

        afterRender: function () {
            _m.$slides = this.$container.find(".slide");
            _m.slideCount = _m.$slides.length;
            _m.currentSlideIndex = -1;

            this.$container.css("background-image", App.Utils.formatBackgroundImageCss(""));
            this.handleResize();
        },

        bindEventsOnce: function () {
            var self = this;

            this.$container.on("click", "a[data-command]", function (e) {
                e.preventDefault();
                var $target = $(e.currentTarget);
                var command = $target.data("command");

                commands[command](e);
            });

            this.$container.on("click", ".slide", function () {
                self.$container.toggleClass("scrollable");
                App.toggleScroll();
            });
        },

        update: function (fileId) {
            var self = this;

            return App.ViewModel.VisualizationViewModel.load(fileId)
                .then(function (visualizationViewModel) {
                    console.log(visualizationViewModel);
                    self.render(visualizationViewModel);
                });
        },

        handleResize: function () {
            var viewportSize = App.Utils.getViewportSize();
            var size = Math.min(viewportSize.width, viewportSize.height);
            var css = Consts.resizeCss
                .replace("{disc-selector}", Consts.discSelector)
                .replace(/{size}/g, size.toString());

            App.Utils.addCss(css);
        },

        show: function () {
            _m.isShowing = true;
            App.toggleScroll(false);
            this.$container.fadeIn();
            this.start();
        },

        hide: function () {
            _m.isShowing = false;
            App.toggleScroll(true);
            commands.close();
        },

        start: function () {
            if (_m.timeout)
                clearTimeout(_m.timeout);

            _showNextSlide();
            _queueNext();
        },

        stop: function () {
            if (_m.timeout)
                clearTimeout(_m.timeout);
        },

        isShowing: function () {
            return _m.isShowing;
        }
    };

    var controller = new App.Controller(options);
    return controller;

})($, _);