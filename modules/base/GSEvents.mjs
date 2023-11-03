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
import GSLog from "./GSLog.mjs";


/**
 * Class for handling events, also a registry of all GS-* element listeners
 * @Class
 */
export default class GSEvents {

	static #protect = false;
	static #cache = new Map();

	static #loaded = false;
	static #susspended = 0;

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
	 * Wait for web page to competely load
	 * 
	 * @async
	 * @param {HTMLElement} target 
	 * @param {string} name 
	 * @param {function} callback 
	 * @param {Promise<number>} timeout 
	 */
	static async waitPageLoad(target, name = 'loaded', callback, timeout = 100, prevent = true) {
		if (!GSEvents.#loaded) await GSEvents.wait(globalThis.window, 'load', timeout, prevent); // DOMContentLoaded
		GSEvents.#loaded = true;
		await GSUtil.timeout(timeout);
		await GSFunction.callFunction(callback);
		GSEvents.sendSuspended(target, name);
	}

	/**
	 * Async version of animation frame
	 * 
	 * @async
	 * @param {function} callback 
	 * @param {boolean} chaind Prevent consequtive chained calls.
	 * @returns {Promise}
	 */
	static async waitAnimationFrame(callback, chained = false) {

		if (chained) {
			if (typeof callback !== 'function') return;
			if (GSEvents.#susspended > 0) return GSFunction.callFunction(callback);
			GSEvents.#susspended++;
		}

		return new Promise((accept, reject) => {
			requestAnimationFrame(async () => {
				try {
					const o = await GSFunction.callFunction(callback);
					accept(o);
				} catch (e) {
					reject(e);
				} finally {
					if (chained && GSEvents.#susspended > 0) GSEvents.#susspended--;
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
	static once(own, qry, event, callback, timeout = 0) {
		const signal = timeout == 0 ? undefined : AbortSignal.timeout(timeout); 
		return GSEvents.listen(own, qry, event, callback, { once: true, signal : signal });
	}

	/**
	 * Async version of event listener
	 * 
	 * @async
	 * @param {*} own 
	 * @param {*} name 
	 * @returns {Promise}
	 */
	static wait(own, name = '', timeout = 0, prevent = true) {
		if (!name) throw new Error('Event undefined!');
		return new Promise((r, e) => {
			GSEvents.once(own, null, name, (e) => {
				if (prevent) GSEvents.prevent(e);
				r(prevent ? e.detail : e);
			}, timeout);
		});
	}
 
	/**
	 * Generic prevent event bubling
	 * 
	 * @param {Event} e 
	 */
	static prevent(e, full = true) {
		if (GSFunction.hasFunction(e, 'preventDefault')) e.preventDefault();
		if (GSFunction.hasFunction(e, 'stopPropagation')) e.stopPropagation();
		if (full && GSFunction.hasFunction(e, 'stopImmediatePropagation')) e.stopImmediatePropagation();
	}

	/**
	 * Generic event disaptcher.
	 * NOTE: If expecting to catch return value, do not use async in listeners
	 * 
	 * @param {HTMLElement} sender element that send event
	 * @param {string} name  Event name to trigger 
	 * @param {object} obj Data object to send 
	 * @param {boolean} bubbles Send event to parent
	 * @param {boolean} composed Send event across shadowDom
	 * @param {boolean} cancelable Event is cancelable
	 * @returns {boolean} false if event is cancelable, and at least one of the event handlers which received event called Event.preventDefault(). Otherwise true.
	 */
	static send(sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		const opt = { detail: obj, bubbles: bubbles, composed: composed, cancelable: cancelable };
		const event = new CustomEvent(name, opt);
		return sender?.dispatchEvent(event);
	}

	/**
	 * Convert event type to native event
	 * @param {string} type 
	 * @param {object} opt 
	 * @returns {Event}
	 */
	static toEvent(type, opt) {
		let evt  = null;
		switch(type) {
			case 'copy' : 
			case 'cut' : 
			case 'paste' : 
				evt = new ClipboardEvent(type, opt);
				break;
			case 'blur' : 
			case 'focus' : 
			case 'focusin' : 
			case 'focusout' : 
				evt = new FocusEvent(type, opt);
				break;
			case 'input' : 
			case 'beforeinput' : 
				evt = new InputEvent(type, opt);
				break;
			case 'keydown' : 
			case 'keyup' : 
			case 'keypress' : 						
				evt = new KeyboardEvent(type, opt);
				break;
			case 'dblclick' : 
			case 'mousedown' : 
			case 'mouseenter' : 
			case 'mouseleave' : 
			case 'mousemove' : 
			case 'mouseout' : 
			case 'mouseover' : 
			case 'mouseup' : 																					
				evt = new MouseEvent(type, opt);
				break;
			case 'submit' : 
				evt = new SubmitEvent(type, opt);
				break;
			case 'touchstart' : 
			case 'touchend' : 
			case 'touchmove' : 
			case 'touchcancel' : 									
				evt = new TouchEvent(type, opt);
				break;
			case 'whell' : 
				evt = new WheelEvent(type, opt);
				break;
			case 'pointerover' : 
			case 'pointerenter' :
			case 'pointerdown' :
			case 'pointermove' :
			case 'pointerup' :
			case 'pointercancel' :
			case 'pointerout' :
			case 'pointerleave' :
			case 'pointerrawupdate' :
			case 'gotpointercapture' :
			case 'lostpointercapture' :				
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
	 * @returns {boolean}
	 */
	static isMouseOrPointerEvent(e) {
		return e instanceof MouseEvent || e instanceof PointerEvent;
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
		return requestAnimationFrame(() => {
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
	 * @returns {number} setTimeout id for cancelation
	 */
	static sendDelayed(timeout = 1, sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		return setTimeout(() => GSEvents.send(sender, name, obj, bubbles, composed, cancelable), timeout);
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
	 * @param {HTMLElement} el Owner element to monitor
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
			elid = GSID.id;
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

	/**
	 * Monitor GSElement 'action' events and trigger class functions if avaialble.
	 * @param {HTMLElement} owner 
	 * @param {String} type 
	 */
	static monitorAction(owner, type) {
		owner.on('action', async (e) => {
			const me = owner;
			const data = e.detail;	
			const action = data.action || data.data?.action;
			await GSEvents.onAction(me, action, type, e);
		});
	}

	/**
	 * Trigger class function defined in 'action' attribute
	 * @param {HTMLElement} owner 
	 * @param {string} action 
	 * @param {string} prefix 
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

	static {
		Object.freeze(GSEvents);
		globalThis.GSEvents = GSEvents;
	}
}

