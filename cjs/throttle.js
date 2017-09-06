'use strict';

// throttleFn()
// returns a throttled function that never runs more than every `delay` milliseconds
// the returned function also has a nice .finish() method.
function throttle(func, delay, skipFirst) {
  if ( typeof delay === 'boolean' ) {
    skipFirst = delay;
    delay = 0;
  }
  delay = delay || 50;
  var throttled = 0;
  var timeout;
  var _args;
  var _this;
  var throttledFn = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    _args = args;
    _this = this;
    if (!throttled) {
      skipFirst ?
          throttled++:
          func.apply(_this, _args);
      timeout = setTimeout(throttledFn.finish, delay);
    }
    throttled++;
  };
  throttledFn.finish = function () {
    clearTimeout( timeout );
    throttled>1 && func.apply(_this, _args);
    throttled = 0;
  };
  return throttledFn;
}

module.exports = throttle;
