/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { OWNER, PARENT } from "../../base/GSConst.mjs";
import { GSDOM } from "../../base/GSDOM.mjs";
import { GSEvents } from "../../base/GSEvents.mjs";
import { GSElement } from "../../GSElement.mjs";

/*
* Shared event handling extensions
*/
const EventsMixin = {

  /**
   * Get shadow dom owner
   * @returns 
   */
  [OWNER]() {
    const own = GSDOM.root(this);
    return GSDOM.unwrap(own);
  },

  /**
   * Get parent GS-* component
   */
  [PARENT]() {
    return GSDOM.parentAll(this).filter(x => x instanceof GSElement).next()?.value;
  },

  ////////////////////////////////////////////////////////////////////////
  // cross shadow query

  /**
   * Find closest top element by CSS selector
   * @param {String} query 
   * @returns {HTMLElement}
   */
  closest(query = '') {
    return GSDOM.closest(this, query);
  },

  /**
   * Find element by CSS selector (top level is this element)
   * @param {String} name 
   * @returns {HTMLElement}
   */
  query(query = '', shadow = false) {
    return GSDOM.query(this, query, false, shadow);
  },

  /**
   * Find multiple elements by CSS selector (top level is this element)
   * @param {String} query 
   * @returns {Array<HTMLElement>}
   */
  queryAll(query = '', shadow = false) {
    return GSDOM.queryAll(this, query, false, shadow);
  },


  ////////////////////////////////////////////////////////////////////////
  // event handling helpers

  /**
   * Generic component signal
   * @param {Boolean} bubbles  Does buuble to upper nodes
   * @param {Boolean} composed Does traverse from shadow DOM 
   */
  notify(bubbles = true, composed = false, data) {
    this.emit('notify', data, bubbles, composed, true);
  },

  /**
   * Send event
   * @param {String} name 
   * @param {Object} obj 
   * @param {Boolean} bubbles 
   * @param {Boolean} composed 
   * @param {Boolean} cancelable 
   */
  emit(name, obj = '', bubbles = false, composed = false, cancelable = false) {
    return GSEvents.send(this, name, obj, bubbles, composed, cancelable);
  },

  /**
   * Wait for event to happen
   * @async
   * @param {String} name 
   * @returns {Promise}
   */
  waitEvent(name = '', timeout = 0) {
    return GSEvents.wait(this, name, timeout);
  },

  /**
   * Listen once for triggered event
   * @param {String} name  A name of the event
   * @param {Function} func A callback function on event trigger
   * @param {Boolean} capture Allow event capture
   * @returns {Boolean}
   */
  once(name, func, capture = false) {
    return this.listen(name, func, true, capture);
  },

  /**
   * Alternative function for event listen
   * @param {String} name  A name of the event
   * @param {Function} func A callback function on event trigger
   * @param {Boolean} once Listen only once
   * @param {Boolean} capture Allow event capture
   * @returns {Boolean}
   */
  on(name, func, once = false, capture = false) {
    return this.listen(name, func, once, capture);
  },

  /**
   * Alternative function for event unlisten
   * @param {String} name  A name of the event
   * @param {Function} func A callback function on event trigger
   * @returns {Boolean}
   */
  off(name, func) {
    return this.unlisten(name, func);
  },

  /**
   * Prevent event firing up the DOM tree
   * @param {Event} e 
   */
  prevent(e, defaults = true, propagate = true, immediate = true) {
    GSEvents.prevent(e, defaults, propagate, immediate);
  },

  /**
   * Attach event to this element
   * @param {String} name  A name of the event
   * @param {Function} func A callback function on event trigger
   * @param {Boolean} once Listen only once
   * @param {Boolean} capture Allow event capture
   * @returns {Boolean}
   */
  listen(name, func, once = false, capture = false) {
    return this.attachEvent(this, name, func, once, capture);
  },

  /**
   * Remove event from this element
   * @param {String} name  A name of the event
   * @param {Function} func A callback function on event trigger
   * @returns {Boolean}
   */
  unlisten(name, func) {
    return this.removeEvent(this, name, func);
  },

  /**
  * Generic event listener appender
  * 
  * @param {HTMLElement} el Element on which to monitor for named events
  * @param {String} name Event name to watch for
  * @param {Function} fn Event trigger callback
  * @param {Boolean} once Listen only once
  * @param {Boolean} capture Allow event capture
  * @returns {Boolean} State if attachment was successful
  */
  attachEvent(el, name = '', fn, once = false, capture = false) {
    return GSEvents.attach(this, el, name, fn, once, capture);
  },

  /**
  * Generic event listener remove
  * @param {HTMLElement} el Element on which to monitor for named events
  * @param {String} name Event name to watch for
  * @param {Function} fn Event trigger callback
  * @returns {Boolean} State if attachment was successful	
  */
  removeEvent(el, name = '', fn) {
    return GSEvents.remove(this, el, name, fn);
  }

  //////////////////////////////////////////////////////////////

}

/**
 * Function to apply mixin into defiend class
 * @param {*} clazz 
 * @returns 
 */
export const mixin = (clazz) => {
  return Object.assign(clazz.prototype || clazz, EventsMixin);
}