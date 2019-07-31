// throttleFn()
// returns a throttled function that never runs more than every `delay` milliseconds
// the returned function also has a nice .finish() method.
var throttle = function (func, delay, skipFirst) {
    var timeout;
    var throttled = 0;
    var _args;
    var _this;
    var throttledFn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _args = args;
        _this = this;
        if (!throttled) {
            skipFirst ?
                throttled++ :
                func.apply(_this, _args);
            timeout = setTimeout(throttledFn.finish, delay);
        }
        throttled++;
    };
    throttledFn.finish = function () {
        timeout && clearTimeout(timeout);
        throttled > 1 && func.apply(_this, _args);
        throttled = 0;
    };
    return throttledFn;
};

module.exports = throttle;
