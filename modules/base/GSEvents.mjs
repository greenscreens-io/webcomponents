/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSEvents class
 * @module base/GSEvents
 */

import GSFunction from "./GSFunction.mjs";
import GSID from "./GSID.mjs";
import GSUtil from "./GSUtil.mjs";
import GSAttr from "./GSAttr.mjs";
import GSDOM from "./GSDOM.mjs";


/**
 * Class for handling events, also a registry of all GS-* element listeners
 * @Class
 */
export default class GSEvents {

	static #cache = new Map();

	static #loaded = false;

	/**
	 * Disable browser console and default context menu
	 */
	static protect() {
		GSEvents.listen(globalThis, null, 'contextmenu', e =>  GSEvents.prevent(e));
		GSEvents.listen(globalThis.document, null, 'keydown', GSEvents.#onKeyDown);
	}

	static #onKeyDown(event) {
		const code = event.code;
		if (code == 'F12') { // Prevent F12
			return false;
		} else if (event.ctrlKey && event.shiftKey && code == 'KeyI') { // Prevent Ctrl+Shift+I
			return false;
		}
	}

	/**
	 * Wait for web page to competely load
	 * 
	 * @async
	 * @param {HTMLElement} target 
	 * @param {string} name 
	 * @param {function} callback 
	 * @param {Promise<number>} timeout 
	 */
	static async waitPageLoad(target, name = 'loaded', callback, timeout = 100) {
		if (!GSEvents.#loaded) await GSEvents.wait(globalThis.window, 'load'); // DOMContentLoaded
		GSEvents.#loaded = true;
		await GSUtil.timeout(timeout);
		GSFunction.callFunction(callback);
		GSEvents.sendSuspended(target, name);
	}

	/**
	 * Async version of animation frame
	 * 
	 * @async
	 * @param {function} callback 
	 * @returns {Promise}
	 */
	static async waitAnimationFrame(callback) {
		return new Promise((r, e) => {
			requestAnimationFrame(() => {
				try {
					r();
					if (typeof callback === 'function') callback();
				} catch (er) {
					console.log(er);
					e(er);
				}
			});
		});
	}

	/**
	 * Listen for an event on a given element or query
	 * @param {*} own 
	 * @param {*} qry 
	 * @param {*} event 
	 * @param {*} callback 
	 * @param {*} opt 
	 * @returns {boolean|Array<boolean>} 
	 */
	static listen(own, qry, event, callback, opt = false) {
		if (!qry && own) return own.addEventListener(event, callback, opt);
		return GSDOM.queryAll(own, qry).map(el => el.addEventListener(event, callback, opt));
	}

	/**
	 * Unlisten for an event on a given element or query
	 * @param {*} own 
	 * @param {*} qry 
	 * @param {*} event 
	 * @param {*} callback 
	 * @returns {boolean|Array<boolean>} 
	 */
	static unlisten(own, qry, event, callback) {
		if (!qry && own) return own.removeEventListener(event, callback);
		return GSDOM.queryAll(own, qry).map(el => el.removeEventListener(event, callback));
	}

	static on = GSEvents.listen;
	static off = GSEvents.unlisten;

	/**
	 * 
	 * @param {*} own 
	 * @param {*} qry 
	 * @param {*} event 
	 * @param {*} callback 
	 * @returns {boolean}
	 */
	static once(own, qry, event, callback) {
		return GSEvents.listen(own, qry, event, callback, { once: true });
	}

	/**
	 * Async version of event listener
	 * 
	 * @async
	 * @param {*} own 
	 * @param {*} name 
	 * @returns {Promise}
	 */
	static wait(own, name = '') {
		const me = this;
		return new Promise((r, e) => {
			if (!name) return e('Event undefined!');
			GSEvents.once(own, null, name, (e) => r(e.detail));
		});
	}
 
	/**
	 * Generic prevent event bubling
	 * 
	 * @param {Event} e 
	 */
	static prevent(e) {
		if (GSFunction.hasFunction(e, 'preventDefault')) e.preventDefault();
		if (GSFunction.hasFunction(e, 'stopPropagation')) e.stopPropagation();
	}

	/**
	 * Generic event disaptcher
	 * 
	 * @param {HTMLElement} sender element that send event
	 * @param {string} name  Event name oto trigger
	 * @param {object} obj Data object to send 
	 * @param {boolean} bubbles Send event to parent
	 * @param {boolean} composed Send event across shadowDom
	 * @param {boolean} cancelable Event is cancelable
	 * @returns {boolean}
	 */
	static send(sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		const event = new CustomEvent(name, { detail: obj, bubbles: bubbles, composed: composed, cancelable: cancelable });
		return sender?.dispatchEvent(event);
	}

	/** 
	 * Generic event disaptcher in suspended rendering
	 * 
	 * @param {HTMLElement} sender element that send event
	 * @param {string} name  Event name to trigger
	 * @param {object} obj Data object to send 
	 * @param {boolean} bubbles Send event to parent
	 * @param {boolean} composed Send event across shadowDom
	 * @param {boolean} cancelable Event is cancelable
	 * @returns {void} 
	 */
	static sendSuspended(sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		requestAnimationFrame(() => {
			GSEvents.send(sender, name, obj, bubbles, composed, cancelable);
		});
	}

	/** 
	 * Generic event disaptcher delayed in miliseconds
	 * 
	 * @param {number} timeout Time to delay event
	 * @param {HTMLElement} sender element that send event
	 * @param {string} name  Event name to trigger
	 * @param {object} obj Data object to send 
	 * @param {boolean} bubbles Send event to parent
	 * @param {boolean} composed Send event across shadowDom
	 * @param {boolean} cancelable Event is cancelable
	 * @returns {void} 
	 */
	static sendDelayed(timeout = 1, sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		setTimeout(() => GSEvents.send(sender, name, obj, bubbles, composed, cancelable), timeout);
	}

	/**
	* Generic event listener appender
	 * @param {HTMLElement} own Event owner
	 * @param {HTMLElement} el Owner element to monitor
	 * @param {string} name Event name to monitor
	 * @param {Function} fn Callback to trigger on event
	 * @param {boolean} once Monitor event only once
	 * @param {boolean} capture Allow event capture
	 * @returns {boolean}
	 */
	static attach(own, el, name = '', fn, once = false, capture = false) {
		if (!el) return false;
		if (el.offline) return false;
		if (!GSFunction.isFunction(fn)) return false;
		if (!GSFunction.hasFunction(el, 'addEventListener')) return false;
		const me = this;
		const obj = me.#eventKey(own, el, name, fn);
		const elmap = me.#getElementMap(own);
		const map = me.#eventMap(elmap, obj.key);
		map.set(obj.fnkey, obj);
		obj.capture = capture;
		if (once) {
			obj.once = (e) => {
				try {
					obj.fn(e);
				} finally {
					me.remove(obj.own, obj.el, obj.name, obj.once);
				}
			};
			Object.defineProperty(obj.once, 'gsid', { value: fn.gsid, writable: false });
		}
		el.addEventListener(name, once ? obj.once : obj.fn, { once: once, capture: capture });
		return true;
	}

	/**
	* Generic event listener remover
	 * @param {HTMLElement} own Event owner
	 * @param {HTMLElement} el Owner elelemt to monitor
	 * @param {string} name Event name to moinitor
	 * @param {Function} fn Callback to trigger on event
	 */
	static remove(own, el, name = '', fn) {
		const me = this;
		const obj = me.#eventKey(own, el, name, fn);
		const elmap = me.#getElementMap(own);
		const map = me.#eventMap(elmap, obj.key);
		const cfg = map.get(obj.fnkey);
		if (cfg) {
			map.delete(cfg.fnkey);
			me.#removeListener(cfg);
		} else if (obj.fnkey === obj.key) {
			for (let m of map.values()) {
				map.delete(m.fnkey);
				me.#removeListener(m);
			}
		}
		if (map.size === 0) elmap.delete(obj.key);
		if (elmap.size === 0) me.#cache.delete(own);
	}

	/**
	 * Release internal engine event listeners
	 * @param {HTMLElement} own Event owner
	 */
	static deattachListeners(own) {
		const me = this;
		const map = me.#removeElementMap(own);
		if (!map) return;

		const it = map.values();
		for (let m of it) {
			for (let o of m.values()) {
				me.#removeListener(o);
			}
			m.clear();
		}
		map.clear();
	}

	/**
	 * Generate an event key object
	 * @param {*} el 
	 * @param {*} name 
	 * @param {*} fn 
	 * @returns {object}
	 */
	static #eventKey(own, el, name = '', fn = '') {
		if (!el) return false;
		const me = this;
		const elid = me.#getElementID(el);
		const fnid = me.#getCallbackID(fn);
		const key = GSID.hashCode(`${elid}${name}`);
		const fnkey = GSID.hashCode(`${elid}${name}${fnid || ''}`);
		return { own: own, fn: fn, el: el, name: name, key: key, fnkey: fnkey };
	}

	/**
	 * Get or create a map holding an event map
	 * @param {Map<HTMLElement, Object>} elmap
	 * @param {HTMLElement} key
	 * @returns {Map<HTMLElement, Object>}
	 */
	static #eventMap(elmap, key) {
		const me = this;
		let map = elmap.get(key);
		if (!map) {
			map = new Map();
			elmap.set(key, map);
		}
		return map;
	}

	static #getCallbackID(fn) {
		if (!GSFunction.isFunction(fn)) return null;
		if (!fn.gsid) Object.defineProperty(fn, 'gsid', { value: GSID.next(), writable: false });
		return fn.gsid;
	}

	static #getElementID(el) {
		let elid = GSAttr.get(el, 'data-gselid');
		if (!elid) {
			elid = GSID.next()
			GSAttr.set(el, 'data-gselid', elid);
		}
		return elid;
	}

	/**
	 * Get or create a map holding an event map
	 * @param {HTMLElement} own
	 * @returns {Map<HTMLElement, Object>}
	 */
	static #getElementMap(own) {
		const me = this;
		return me.#eventMap(me.#cache, own);
	}

	static #removeElementMap(own) {
		const me = this;
		const map = me.#cache.get(own);
		if (!map) return;
		me.#cache.delete(own);
		return map;
	}

	static #removeListener(o) {
		o.el.removeEventListener(o.name, o.once ? o.once : o.fn, { capture: o.capture });
		o.el = null;
		o.fn = null;
		o.once = null;
	}

	static {
		Object.freeze(GSEvents);
		globalThis.GSEvents = GSEvents;
	}
}

