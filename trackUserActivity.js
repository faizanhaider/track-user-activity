(function ($){
    // options
    var DEFAULT_OPTIONS = {
        // user is considered idle after this many milli seconds. 5 minutes default
        inactivity: 300000,

        // This is used if polling is required.
        pollingInterval: 0,

        // if timer resume is enabled based on events
        click_reset: true,

        // Events for resetting the timeout
        events: 'keypress mouseover storage swipe tap',

        // Event Call function
        onActivityEvent: $.noop,

        // fires when the user becomes idle
        onIdle: function(){
            console.log("user has been inactive for recorded time")
        },

        // fires when activity is resumed
        onResumeActivity: $.noop,

        // fires when logout is called
        onLogout: $.noop,

        // If tracking is enabled
        enableTracking: true,

        domain: window.location.host
    };

    // exposed methods
    var methods = {
        init: function (options) {
            var settings = $.extend({}, DEFAULT_OPTIONS, options || {});

            return this.each(function () {
                $(this).data("idleTimeout", new $.idleTimeout(settings));
            });
        },

        logout: function() {
            return this.data("idleTimeout").logout();
        },

        resume: function() {
            return this.data("idleTimeout").resume();
        }
    };

    $.idleTimeout = function(options) {

        this.logout = function(){
            var self = this;

            var cookies = $.cookie();
            for (var cookie in cookies) {
                $.removeCookie(cookie, {path: '/'});
            }

            self.enableTracking = false;
            self._stopTimer();

            self.options.onLogout.call( self, arguments ); // call the resume callback
        };

        this.resume = function(){
            var self = this;

            self.enableTracking = true;
            self._startTimer(); // start up the timer again
            this._bindEvents();

            self.options.onResumeActivity.call( self, arguments ); // call the resume callback
        };

        this.idle = function() {
            var self = this;

            self.enableTracking = false;
            this._unbindEvents();

            self.options.onIdle.call( self, arguments ); // call the resume callback
        };

        this._startTimer = function(){
            var self = this;

            var timerFunction = function(){
                if($.cookie('caremerge_api_key')) {
                    if(!!self.options.pollingInterval) {
                        var lastActivity = parseInt($.cookie('lastActivity'));

                        if ((new Date()).getTime() < lastActivity + self.options.inactivity) {
                            self.resume.call(self, arguments);
                        } else {
                            self.idle.call(self, arguments);
                        }
                    } else {
                        self.idle.call(self, arguments);
                    }
                } else {
                    self.logout.call(self, arguments);
                }

            };

            self._stopTimer();

            if(!!this.options.pollingInterval){
                this.timer = setInterval(timerFunction, self.options.pollingInterval);
            } else {
                this.timer = setTimeout(timerFunction, self.options.inactivity);
            }
        };

        this._stopTimer = function(){
            if(!!this.options.pollingInterval) {
                clearInterval(this.timer);
            } else {
                clearTimeout(this.timer);
            }
        };

        this._bindEvents = function () {
            var self = this;

            if (this.options.click_reset)
            {
                this._unbindEvents();
                $(window).bind($.trim((this.options.events+' ').split(' ').join(' ')), this, this.eventHandler);
            }
        };

        this._unbindEvents = function () {
            var self = this;

            if (this.options.click_reset)
            {
                $(window).unbind($.trim((this.options.events+' ').split(' ').join(' ')), this.eventHandler);
            }
        };

        this.eventHandler = function (e) {
            var self = e.data;

            self.options.onActivityEvent.call(self, e);

            if(self.options.enableTracking){
                window_active_flag = true;
                $.removeCookie('lastActivity', {path: '/'});
                $.cookie('lastActivity', (new Date()).getTime(), {path: '/', domain: self.options.domain});
            }
        };

        //Constructor Operation starts here
        var self = this;

        this.options = options;

        $.removeCookie('lastActivity', {path: '/'});
        $.cookie('lastActivity', (new Date()).getTime(), {path: '/', domain: self.options.domain});

        this._startTimer();

        this._bindEvents();
    };

    // expose
    $.fn.trackUserActivity = function(method){
        // Method calling and initialization logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return methods.init.apply(this, arguments);
        }
        return this;
    };

})(jQuery);
