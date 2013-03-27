// dispatcher.js
(function(window, app) {

    // Animation Tick
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || 
            window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        // if we are on a browser that doesn't implement requestAnimationFrame, we create our own 
        // using setTimeout
        if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        // if we are on a browser that doesn't implement cancelAnimationFrame, we create our own 
        // using clearTimeout
        if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
            window.clearTimeout(id);
        };
    }());


    function Dispatcher() {
        var that = this;
        this.registrees = [];
        this.running = false;
        this.time = {
            now: Date.now(),
            previous: that.timeNow,
            delta: 0
        };

        // called by requestAnimationFrame
        this.loop = function() {
            if (that.running) {
                that.time.now = Date.now();
                that.time.delta = (that.time.now - that.time.previous) * 0.001;

                if (that.time.delta > 0) {
                    for (var i = 0; i < that.registrees.length; i++) {
                        that.registrees[i].update(that.time);
                    }
                }

                that.time.previous = that.time.now;
                
                // request to be called again
                window.requestAnimationFrame(that.loop);
            }
        };
    }

    Dispatcher.prototype.register = function(o) {
        this.registrees.push(o);
    };

    Dispatcher.prototype.deregister = function(o) {
        var index = this.registrees.indexOf(o);
        if (index >= 0) {
            this.registrees.splice(index, 1);
        }
    };

    Dispatcher.prototype.start = function() {
        if (this.running) {
            return;
        } else {
            this.running = true;
            this.loop();
        }
    };

    Dispatcher.prototype.stop = function() {
        this.running = false;
    };

    app.util.dispatcher = new Dispatcher();

}(window, app));