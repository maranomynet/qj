'use strict';

let _matcher;
function matches(selector, elm) {
  if ( _matcher == null ) {
    _matcher = elm.matches || elm.msMatchesSelector || elm.webkitMatchesSelector || (() => false);
  }
  return _matcher.call(elm, selector);
}

function closestParent(selector/*:string */, elm/*:Node */, stopper/*::?:Element */) {
  let _stopper = stopper || null;
  while ( elm && !matches(selector, elm) && elm !== _stopper ) {
    elm = elm.parentNode;
  }
  return elm === _stopper ? null : elm;
}

module.exports = closestParent;
