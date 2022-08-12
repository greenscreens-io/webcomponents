/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSListeners class
 * @module base/GSListeners
 */

import GSID from "./GSID.mjs";
import GSUtil from "./GSUtil.mjs";

/**
 * Registry of all GS-* element listeners
 * @Class
 */
export default class GSListeners {

	static #cache = new Map();

	/**
	* Generic event listener appender
	 * @param {HTMLElement} own Event owner
	 * @param {HTMLElement} el Owner elelemt to monitor
	 * @param {string} name Event name to moinitor
	 * @param {Function} fn Callback to trigger on event
	 * @param {boolean} once Monitor event only once
	 * @param {boolean} capture Allwo event capture
	 * @returns {boolean}
	 */
	static attachEvent(own, el, name = '', fn, once = false, capture = false) {
		if (!el) return false;
		if (el.offline) return false;
		if (!GSUtil.isFunction(fn)) return false;
		if (!GSUtil.hasFunction(el, 'addEventListener')) return false;
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
					me.removeEvent(obj.own, obj.el, obj.name, obj.once);
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
	static removeEvent(own, el, name = '', fn) {
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
		if (!GSUtil.isFunction(fn)) return null;
		if (!fn.gsid) Object.defineProperty(fn, 'gsid', { value: GSID.next(), writable: false });
		return fn.gsid;
	}

	static #getElementID(el) {
		let elid = GSUtil.getAttribute(el, 'data-gselid');
		if (!elid) {
			elid = GSID.next()
			GSUtil.setAttribute(el, 'data-gselid', elid);
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
		Object.freeze(GSListeners);
	}
}
