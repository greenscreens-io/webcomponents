/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * A module loading GSLog class
 * @module base/GSLog
 */

/** 
 * Internal logging mechanism
 * @Class
 */
export class GSLog {

	/**
	 * static flag is loging enabled or disabled
	 */
	static logging = true;
	static tracing = false;

	/**
	 * Log info message
	 * @param {HTMLElement} el 
	 * @param {String} msg 
	 */
	static info(el, msg) {
		this.#print(el, msg, true, 'info');
	}

	/**
	 * Log warn message
	 * @param {HTMLElement} el 
	 * @param {String} msg 
	 */
	static warn(el, msg) {
		this.#print(el, msg, true, 'warn');
	}

	/**
	 * Log error message
	 * @param {HTMLElement} el 
	 * @param {String} msg 
	 */
	static error(el, msg) {
		this.#print(el, msg, true, 'error');
	}

	/**
	 * Debug messages only if tracing flag enabled
	 * @param {*} el 
	 * @param {*} msg 
	 */
	static trace(el, msg) {
		if (GSLog.tracing) this.#print(el, msg, false, 'error');
	}

	/**
	 * Generic logging function
	 * @param {HTMLElement} el Element to log (optional)
	 * @param {String} msg Message to log
	 * @param {Boolean} forced - when logging disabled globaly, use this to force logging
	 */
	static log(el, msg, forced) {
		this.#print(el, msg, forced);
	}

	static #print(el, msg, forced, type) {
		if (!(forced || this.logging)) return;
		const tmp = el ? `${el.nodeName} -> ${el.id}: ${msg}` : msg;
		let fn = console[type || 'log'];
		fn = typeof fn === 'function' ? fn : console.log;
		fn(tmp);
		if (msg instanceof Error) fn(msg);
	}

	static {
		Object.seal(GSLog);
	}
}


