'use strict';

const A = [].slice;

function qq(selector/*:string */, root/*::?:Root */)/*:Element[] */ {
  return (!selector || root===null) ? [] : A.call((root||document).querySelectorAll(selector));
}

// reenable selected HTML elements that were disbbled by htmlToDiv()
function reenableElms(elm, tagName) {
  const disabledTagName = tagName + '--disabled';
  const re = new RegExp('(<\\/?'+ tagName +')--disabled([ >])', 'gi');
  const enable = (elm) => {
    elm.outerHTML = elm.outerHTML.replace(re, '$1$2');
  };
  if ( elm.tagName.toLowerCase() === disabledTagName ) {
    enable(elm);
  }
  // Since none of the elements disabled by htmlToDiv() may be nested
  // we can assume this is an either or case.
  else {
    qq(disabledTagName, elm).forEach(enable);
  }
  return elm;
}

module.exports = reenableElms;
