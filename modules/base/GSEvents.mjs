/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSEvents class
 * @module base/GSEvents
 */

import { GSFunction } from "./GSFunction.mjs";
import { GSID } from "./GSID.mjs";
import { GSUtil } from "./GSUtil.mjs";
import { GSDOM } from "./GSDOM.mjs";
import { GSLog } from "./GSLog.mjs";

/**
 * Class for handling events, also a registry of all GS-* element listeners
 * @Class
 */
export class GSEvents {

	static #rid = 0;
	static #protect = false;
	static #cache = new Map();

	static #loaded = false;
	static #suspended = 0; // Corrected typo

	get altContext() {
		return GSEvents.#protect;
	}

	set altContext(val) {
		GSEvents.#protect = GSUtil.asBool(val, true);
	}

	/**
	 * Disable browser console and default context menu
	 */
	static protect() {
		GSEvents.listen(globalThis, null, 'contextmenu', GSEvents.#onContext);
		GSEvents.listen(globalThis.document, null, 'keydown', GSEvents.#onKeyDown);
	}

	static #onContext(event) {
		if (GSEvents.#protect || !event.shiftKey) GSEvents.prevent(event);
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
	 * Wait for web page to completely load, then send event to target element
	 * DOMContentLoaded vs load ?!
	 * @async
	 * @param {HTMLElement} target 
	 * @param {String} name 
	 * @param {function} callback 
	 * @param {Promise<number>} timeout 
	 */
	static async waitPageLoad(target, name = 'loaded', callback, timeout = 0, prevent = true) {
		if (!GSEvents.#loaded) {
			try {
				await GSEvents.wait(globalThis.window, 'load', timeout, prevent);
				GSEvents.#loaded = true;
			} catch (e) {
				console.error('Error waiting for page load:', e); // Improved error handling
			}
		}
		if (GSEvents.#loaded) {
			await GSFunction.callFunction(callback);
			GSEvents.sendSuspended(target, name);
		}
	}

	/**
	 * Async version of event listener
	 * 
	 * @async
	 * @param {HTMLElement} own 
	 * @param {String} name 
	 * @param {Number} timeout  
	 * @param {Boolean} prevent 
	 * @returns {Promise}
	 */
	static wait(own, name = '', timeout = 0, prevent = true) {
		if (GSUtil.isStringEmpty(name)) throw new Error('Event undefined!');
		if (!GSUtil.isNumber(timeout)) throw new Error('Invalid timeout value!');
		if (timeout > 0) return GSEvents.once(own, null, name, null, timeout);
		return new Promise(resolve => {
			GSEvents.once(own, null, name, e => {
				if (prevent) GSEvents.prevent(e);
				resolve(e);
			}, timeout);
		});
	}

	/**
	 * Async version of animation frame
	 * 
	 * @async
	 * @param {function} callback 
	 * @param {Boolean} chaind Prevent consequtive chained calls.
	 * @returns {Promise}
	 */
	static async waitAnimationFrame(callback, chained = false) {

		if (chained) {
			if (typeof callback !== 'function') return;
			if (GSEvents.#suspended > 0) return GSFunction.callFunction(callback);
			GSEvents.#suspended++;
		}

		return new Promise((accept, reject) => {
			requestAnimationFrame(async () => {
				try {
					const o = await GSFunction.callFunction(callback);
					accept(o);
				} catch (e) {
					reject(e);
				} finally {
					if (chained && GSEvents.#suspended > 0) GSEvents.#suspended--;
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
	 * Wait for an event. Also, trigger on timeout if event not triggered.
	 * @param {HTMLElement} own 
	 * @param {String} qry Optional selector within owner
	 * @param {String} event Event name to wait for
	 * @param {*} callback Function to call 
	 * @param {Number | AbortSignal} timeout If GT 0, retrun Promise
	 * @returns {Boolean}
	 */
	static once(own, qry, event, callback, timeout = 0) {
		const signal = GSEvents.#toSignal(timeout);
		if (signal && signal.internal) {
			return new Promise((resolve, reject) => {
				GSEvents.listen(own, qry, event, evt => {
					signal.removeEventListener('abort', reject);
					callback?.(evt);
					resolve(evt);
				}, { once: true, signal: signal });
				signal.addEventListener('abort', reject);
			});
		}
		return GSEvents.listen(own, qry, event, callback, { once: true, signal: signal });
	}

	/**
	 * Generic prevent event
	 *  default - prevent system default event handling
	 *  propagation - prevent all bubbling
	 *  immedate - prevent all bubbling + this element 
	 * 
	 * @param {Event} e 
	 */
	static prevent(e, defaults = true, propagate = true, immediate = true) {
		if (e) {
			if (defaults) e.preventDefault?.();
			if (propagate) e.stopPropagation?.();
			if (immediate) e.stopImmediatePropagation?.();
		}
	}

	/**
	 * Generic event disaptcher.
	 * NOTE: If expecting to catch return value, do not use async in listeners
	 * 
	 * @param {HTMLElement} sender element that send event
	 * @param {String} name  Event name to trigger 
	 * @param {Object} obj Data object to send 
	 * @param {Boolean} bubbles Send event to parent
	 * @param {Boolean} composed Send event across shadowDom
	 * @param {Boolean} cancelable Event is cancelable
	 * @returns {Boolean} false if event is cancelable, and at least one of the event handlers which received event called Event.preventDefault(). Otherwise true.
	 */
	static send(sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		if (!GSUtil.isString(name) || name.length === 0) return false;
		const opt = { detail: obj, bubbles: bubbles, composed: composed, cancelable: cancelable };
		const event = new CustomEvent(name, opt);
		return sender?.dispatchEvent(event);
	}

	/**
	 * Redispatch event to target, preventing original event handling
	 * @param {HTMLElement} target
	 * @param {Event} e 
	 */
	static redispatch(target, e) {
		GSEvents.prevent(e, true, true, true);
    	GSEvents.send(target, e.type, e.detail, e.bubbles, e.composed, e.cancelable );
	}	

	/**
	 * Convert event type to native event
	 * @param {String} type 
	 * @param {Object} opt 
	 * @returns {Event}
	 */
	static toEvent(type, opt) {
		let evt = null;
		switch (type) {
			case 'copy':
			case 'cut':
			case 'paste':
				evt = new ClipboardEvent(type, opt);
				break;
			case 'blur':
			case 'focus':
			case 'focusin':
			case 'focusout':
				evt = new FocusEvent(type, opt);
				break;
			case 'input':
			case 'beforeinput':
				evt = new InputEvent(type, opt);
				break;
			case 'keydown':
			case 'keyup':
			case 'keypress':
				evt = new KeyboardEvent(type, opt);
				break;
			case 'dblclick':
			case 'mousedown':
			case 'mouseenter':
			case 'mouseleave':
			case 'mousemove':
			case 'mouseout':
			case 'mouseover':
			case 'mouseup':
				evt = new MouseEvent(type, opt);
				break;
			case 'submit':
				evt = new SubmitEvent(type, opt);
				break;
			case 'touchstart':
			case 'touchend':
			case 'touchmove':
			case 'touchcancel':
				evt = new TouchEvent(type, opt);
				break;
			case 'whell':
				evt = new WheelEvent(type, opt);
				break;
			case 'pointerover':
			case 'pointerenter':
			case 'pointerdown':
			case 'pointermove':
			case 'pointerup':
			case 'pointercancel':
			case 'pointerout':
			case 'pointerleave':
			case 'pointerrawupdate':
			case 'gotpointercapture':
			case 'lostpointercapture':
				evt = new PointerEvent(type, opt);
				break;
			default:
				evt = new CustomEvent(type, opt);
		}
		return evt;
	}

	/**
	 * Helper to fix some Firefox issues, detect event
	 * @param {Event} e 
	 * @returns {Boolean}
	 */
	static isMouseOrPointerEvent(e) {
		return e instanceof MouseEvent || e instanceof PointerEvent;
	}

	/** 
	 * Generic event disaptcher in suspended rendering
	 * 
	 * @param {HTMLElement} sender element that send event
	 * @param {String} name  Event name to trigger
	 * @param {Object} obj Data object to send 
	 * @param {Boolean} bubbles Send event to parent
	 * @param {Boolean} composed Send event across shadowDom
	 * @param {Boolean} cancelable Event is cancelable
	 * @returns {void} 
	 */
	static sendSuspended(sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		return requestAnimationFrame(() => {
			GSEvents.send(sender, name, obj, bubbles, composed, cancelable);
		});
	}

	/** 
	 * Generic event disaptcher delayed in miliseconds
	 * 
	 * @param {Number} timeout Time to delay event
	 * @param {HTMLElement} sender element that send event
	 * @param {String} name  Event name to trigger
	 * @param {Object} obj Data object to send 
	 * @param {Boolean} bubbles Send event to parent
	 * @param {Boolean} composed Send event across shadowDom
	 * @param {Boolean} cancelable Event is cancelable
	 * @returns {Number} setTimeout id for cancelation
	 */
	static sendDelayed(timeout = 1, sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		return setTimeout(() => GSEvents.send(sender, name, obj, bubbles, composed, cancelable), timeout);
	}

	/**
	* Generic event listener appender
	 * @param {HTMLElement} own Event owner (used to store event handler for later release by element destruction )
	 * @param {HTMLElement} el Owner element to monitor
	 * @param {String} name Event name to monitor
	 * @param {Function} fn Callback to trigger on event
	 * @param {Boolean} once Monitor event only once
	 * @param {Boolean} capture Allow event capture
	 * @returns {Boolean}
	 */
	static attach(own, el, name = '', fn, once = false, capture = false) {
		if (!el) return false;
		if (!(window instanceof Window || el.isConnected)) return false;
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
	 * @param {HTMLElement} el Owner element to monitor
	 * @param {String} name Event name to moinitor
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
	static detachListeners(own) {
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
	 * @returns {Object}
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
		let elid = el[Symbol.for('gs-event-id')];
		if (!elid) {
			elid = GSID.id;
			el[Symbol.for('gs-event-id')] = elid;
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

	/**
	 * Internal helper, converter to Abortignal
	 * @param {*} timeout 
	 */
	static #toSignal(timeout = 0) {
		if (GSUtil.isNumber(timeout) && timeout > 0) {
			timeout = AbortSignal.timeout(timeout);
			timeout.internal = true;
			return timeout;
		}
		if (timeout instanceof AbortSignal) return timeout;
		return undefined;
	}

	/**
	 * Monitor GSElement 'action' events and trigger class functions if available.
	 * @param {HTMLElement} owner 
	 * @param {String} type 
	 */
	static monitorAction(owner, type) {
		owner.on('action', (e) => {
			const me = owner;
			const data = e.detail;
			const action = GSUtil.isString(data) ? data : data.action || data.data?.action;
			GSEvents.onAction(me, action, type, e);
		});
	}

	/**
	 * Trigger class function defined in 'action' attribute
	 * @param {HTMLElement} owner 
	 * @param {String} action 
	 * @param {String} prefix 
	 * @param {Event} evt 
	 * @returns {*} Action result or false
	 */
	static async onAction(owner, action, prefix, evt) {

		const callback = GSEvents.findAction(owner, action, prefix);
		if (!callback) return;

		GSEvents.prevent(evt);
		let sts = false;
		try {
			if (GSFunction.isFunctionAsync(callback)) {
				sts = await callback(evt);
			} else {
				sts = callback(evt);
			}
		} catch (e) {
			sts = e;
			if (!GSFunction.isFunction(owner.onError)) throw e;
			owner.onError(e);
		}
		return sts;
	}


	/**
	 * Find object instance action by name
	 * @param {Object} owner 
	 * @param {String} action 
	 * @returns {Function}
	 */
	static findAction(owner, action = '', prefix = '') {
		let sts = false;
		if (!action) return sts;
		const me = owner;
		action = GSUtil.capitalizeAttr(GSUtil.capitalize(action));
		prefix = GSUtil.capitalizeAttr(GSUtil.capitalize(prefix));
		const name = `on${prefix}${action}`;
		if (globalThis.GS_LOG_ACTION) GSLog.warn(owner, `Action : ${name}`);
		const fn = me[name];
		sts = GSFunction.isFunction(fn);
		sts = sts && !GSFunction.isFunctionNative(fn);
		return sts ? me[name].bind(me) : null
	}

	static #onResize() {
		clearTimeout(GSEvents.#rid);			
		GSEvents.#rid = setTimeout(async () => {
			await GSEvents.waitAnimationFrame();
			GSEvents.send(window, 'resized');
		}, 100);
	}

	/**
	 * Helper tool to notify when window resized. 
	 * Can be activated only once.
	 * Trigger 'resized' event on window on resize timeout.
	 */
	static resizeMonitor() {
		const me = GSEvents;
		const own = document.documentElement;
		const obj = me.#eventKey(own, window, 'resize', me.#onResize);
		const elmap = me.#getElementMap(own);
		const def = elmap.get(obj.key)?.get(obj.fnkey);
		if (!def) me.attach(own, window, 'resize', me.#onResize);
	}

	static {
		//GSEvents.resizeMonitor();
		Object.freeze(GSEvents);
		globalThis.GSEvents = GSEvents;
		GSEvents.waitPageLoad();
	}
}

