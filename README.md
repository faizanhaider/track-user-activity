# track-user-activity
Update cookie named lastActivity to keep track if user is active on current tab.

# usage
$(document).trackUserActivity({     
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
        });
