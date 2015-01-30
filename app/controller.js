App.Controller = (function (_) {

	var required = function (val) {
		if (val === null || typeof val === "undefined") {
			throw "App.Controller: Missing argument";
		} else {
			return val;
		}
	};

	var optional = function (func) {
		return func || function () {};
	};

	var Controller = App.Class.define(function (options) {

		options = options || {};

		for (var key in options)
			this[key] = options[key];

		this.viewName =			required( options.viewName );
		this.afterInit = 		optional( options.afterInit );
		this.afterRender = 		optional( options.afterRender );
		this.bindEventsOnce = 	optional( options.bindEventsOnce );
		this.bindEventsAfterRender =
								optional( options.bindEventsAfterRender );

	}, {
		setCallback: function (name, callback) {
			this.callbacks = this.callbacks || {};
	        this.callbacks[name] = callback;
	    },

		init: function (containerId) {
	        this.containerSelector = "#" + containerId;
	        this.$container = $(this.containerSelector);
	        this.bindEventsOnce();

	       	this.afterInit.apply(this);
	    },

	    render: function (model) {
	        if (model) {
	            this.model = model;
	            var html = App.View.render(this.viewName, model);
	            this.$container.html(html);

	            this.afterRender.apply(this);
	            this.bindEventsAfterRender.apply(this);
	        }
	    }
	});

	return Controller;
})(_);