/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSLog class
 * @module base/GSLog
 */

/** 
 * Internal logging mechanism
 * @Class
 */
export default class GSLog {

	/**
	 * static flag is loging enabled or disabled
	 */
	static logging = true;

	/**
	 * Log info message
	 * @param {HTMLElement} el 
	 * @param {string} msg 
	 */
	static info(el, msg) {
		this.#print(el, msg, true, 'info');
	}

	/**
	 * Log warn message
	 * @param {HTMLElement} el 
	 * @param {string} msg 
	 */
	static warn(el, msg) {
		this.#print(el, msg, true, 'warn');
	}

	/**
	 * Log error message
	 * @param {HTMLElement} el 
	 * @param {string} msg 
	 */
	static error(el, msg) {
		this.#print(el, msg, true, 'error');
	}


	/**
	 * Generif logging function
	 * @param {HTMLElement} el Element to log (optional)
	 * @param {string} msg Message to log
	 * @param {boolean} forced - when logging disable globaly, use this to forse logging
	 */
	static log(el, msg, forced) {
		this.#print(el, msg, forced);
	}

	static #print(el, msg, forced, type) {
		if (!(forced || this.logging)) return;
		let fn = console[type || 'log'];
		fn = typeof fn === 'function' ? fn : console.log;
		if (el) return fn(`${el.nodeName} -> ${el.id}: ${msg}`);
		fn(msg);
	}

	static {
		Object.seal(GSLog);
	}
}

