'use strict';

if ( typeof window !== 'undefined' && !window.Promise ) {
  // https://github.com/lhorie/mithril.js/blob/next/promise/promise.js
  /* eslint-disable */
  var PromisePolyfill = function(executor) {
    if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
    if (typeof executor !== "function") throw new TypeError("executor must be a function")

    var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
    var instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
    var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
    function handler(list, shouldAbsorb) {
      return function execute(value) {
        var then;
        try {
          if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
            if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
            executeOnce(then.bind(value));
          }
          else {
            callAsync(function() {
              if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value);
              for (var i = 0; i < list.length; i++) list[i](value);
              resolvers.length = 0, rejectors.length = 0;
              instance.state = shouldAbsorb;
              instance.retry = function() {execute(value);};
            });
          }
        }
        catch (e) {
          rejectCurrent(e);
        }
      }
    }
    function executeOnce(then) {
      var runs = 0;
      function run(fn) {
        return function(value) {
          if (runs++ > 0) return
          fn(value);
        }
      }
      var onerror = run(rejectCurrent);
      try {then(run(resolveCurrent), onerror);} catch (e) {onerror(e);}
    }

    executeOnce(executor);
  };
  PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
    var self = this, instance = self._instance;
    function handle(callback, list, next, state) {
      list.push(function(value) {
        if (typeof callback !== "function") next(value);
        else try {resolveNext(callback(value));} catch (e) {if (rejectNext) rejectNext(e);}
      });
      if (typeof instance.retry === "function" && state === instance.state) instance.retry();
    }
    var resolveNext, rejectNext;
    var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject;});
    handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
    return promise
  };
  PromisePolyfill.prototype.catch = function(onRejection) {
    return this.then(null, onRejection)
  };
  PromisePolyfill.resolve = function(value) {
    if (value instanceof PromisePolyfill) return value
    return new PromisePolyfill(function(resolve) {resolve(value);})
  };
  PromisePolyfill.reject = function(value) {
    return new PromisePolyfill(function(resolve, reject) {reject(value);})
  };
  PromisePolyfill.all = function(list) {
    return new PromisePolyfill(function(resolve, reject) {
      var total = list.length, count = 0, values = [];
      if (list.length === 0) resolve([]);
      else for (var i = 0; i < list.length; i++) {
        (function(i) {
          function consume(value) {
            count++;
            values[i] = value;
            if (count === total) resolve(values);
          }
          if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
            list[i].then(consume, reject);
          }
          else consume(list[i]);
        })(i);
      }
    })
  };
  PromisePolyfill.race = function(list) {
    return new PromisePolyfill(function(resolve, reject) {
      for (var i = 0; i < list.length; i++) {
        list[i].then(resolve, reject);
      }
    })
  };
  /* eslint-enable */
  window.Promise = PromisePolyfill;
}

function makeQueryString(paramsObj) {
  return Object.keys(paramsObj)
      .map((key) => {
        const param = paramsObj[key];
        return param!=null ? key+'='+encodeURIComponent(''+param) : '';
      })
      .filter((item) => item)
      .join('&');
}

function addUrlParams(url, paramsObj) {
  const hashUrl = url.split('#');
  url = hashUrl[0].replace(/\?$/, '');
  const hash = hashUrl[1] ? '#'+hashUrl[1] : '';
  let queryString = makeQueryString(paramsObj);
  if ( queryString.length ) {
    queryString = (/\?/.test(url) ? '&' : '?') + queryString;
  }
  return url + queryString + hash;
}

// Minimal, promise-returning ajax HTTP GET function.
// No bells, whistles, kitchen-plumbing, options, etc.
// Use fetch (w. polyfill) if you need more power).

function load(url, params/*, opts*/) {
  if ( params ) {
    url = addUrlParams(url, params);
  }
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        resolve(request.responseText);
      }
      else {
        reject();
      }
    };
    request.onerror = () => {
      reject();
    };
    request.send();
  });
}

module.exports = load;
