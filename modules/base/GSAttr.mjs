/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSUtil from "./GSUtil.mjs";

/**
 * A module loading GSAttr class
 * @module base/GSDOM
 */

/**
 * A generic set of static functions to handle DOM Attributes
 * @class
 */
export default class GSAttr {

	/**
	 * Check if given element is of type HTMLElement
	 * NOTE: GSDOM.isHTMLElement duplicate - prevent circular import
	 * @returns {boolean}
	 */
	static isHTMLElement(el) {
		return el instanceof HTMLElement;
	}

	/**
	  * Generic function to change element node attribute
	  * 
	  * @param {HTMLElement} el Target to receive attribute value
	  * @param {string} name Attribite name
	  * @param {boolean} val Attribute value
	  */
	static toggle(el, name, val = false) {
		if (!GSAttr.isHTMLElement(el)) return;
		if (val) {
			el.setAttribute(name, '');
		} else {
			el.removeAttribute(name);
		}
	}

	/**
	 * Generic function to change elment node attribute
	 * 
	 * @param {HTMLElement} el Target to receive attribute value
	 * @param {string} name Attribite name
	 * @param {string} val Attribute value
	 */
	static set(el, name, val) {
		if (!GSAttr.isHTMLElement(el)) return;
		if (GSUtil.normalize(val)) {
			el.setAttribute(name, val);
		} else {
			el.removeAttribute(name);
		}
	}

	/**
	 * Generic function to get element node attribute
	 * 
	 * @param {HTMLElement} el Element containing attribute
	 * @param {string} name Attribute name
	 * @param {string} val Default value
	 * @returns {string}
	 */
	static get(el, name = '', val = '') {
		if (!GSAttr.isHTMLElement(el)) return val;
		const v = el.getAttribute(name) || val;
		return GSUtil.normalize(v);
	}

	/**
	 * Get attribute as boolean type
	 * 
	 * @param {HTMLElement} el Element containing attribute
	 * @param {string} name Attribute name
	 * @param {string} val Default value
	 * @returns {boolean}
	 */
	static getAsBool(el, name = '', val = 'false') {
		const attr = GSAttr.get(el, name, val);
		return GSUtil.asBool(attr, val);
	}

	/**
	 * Get attribute as numberic type
	 * 
	 * @param {HTMLElement} el Element containing attribute
	 * @param {string} name Attribute name
	 * @param {string} val Default value
	 * @returns {number}
	 */
	static getAsNum(el, name = '', val = '0') {
		const attr = GSAttr.get(el, name, val);
		return GSUtil.asNum(attr, val);
	}

	/**
	 * Get attribute as JSON object type
	 * 
	 * @param {HTMLElement} el Element containing attribute
	 * @param {string} name Attribute name
	 * @param {string} val Default value
	 * @returns {JSON}
	 */
	static getAsJson(el, name = '', val = '0') {
		const attr = GSAttr.get(el, name, val, {});
		return GSUtil.toJson(attr);
	}

	/**
	 * Store data into attribute as boolean
	 * @param {HTMLElement} el Element containing attribute
	 * @param {string} name Attribute name
	 * @param {boolean} val Default value
	 */
	static setAsBool(el, name = '', val = 'false') {
		GSAttr.set(el, name, GSUtil.asBool(val), false);
	}

	/**
	 * Store data into attribute as numeric
	 * @param {HTMLElement} el Element containing attribute
	 * @param {string} name Attribute name
	 * @param {Number} val Default value
	 */	
	static setAsNum(el, name = '', val = '0') {
		GSAttr.set(el, name, GSUtil.asNum(val), NaN);
	}

	/**
	 * Store data into attribute as JSON string
	 * @param {HTMLElement} el Element containing attribute
	 * @param {string} name Attribute name
	 * @param {string val Default value
	 */
	static setAsJson(el, name = '', val = '0') {
		GSAttr.set(el, name, JSON.stringify(val), '{}');
	}

	/**
	 * Convert JSON object to attribute string 
	 * @param {*} obj 
	 * @returns 
	 */
	static flattenJson(obj) {
		return Object.entries(obj||{}).map(kv => `${kv[0]}=${kv[1]}`).join(' ');
	}

	/**
	 * Apply JSON object to elemtn attributes
	 * @param {*} obj 
	 * @returns 
	 */
	static jsonToAttr(obj, el) {
		if (!GSAttr.isHTMLElement(el)) return;
		Object.entries(obj||{}).map(kv => GSAttr.set(el, kv[0], kv[1]));
	}
	
	/**
	 * Convert list of data attributes into a string list
	 * @param {HTMLElement} el 
	 * @returns {string}
	 */
	static dataToString(el) {
		return Array.from(el.attributes)
			.filter(v => v.name.startsWith('data-'))
			.map(v => `${v.name}="${v.value}"`)
			.join(' ');
	}

	/**
	 * Convert list of element attributes into a flat list separated by given separator (default ' ')
	 * @param {HTMLMediaElement} el 
	 * @param {String} sep 
	 * @returns {String}
	 */
	static flatten(el, sep = ' ') {
		return Array.from(el?.attributes || []).map(a => `${a.name}="${a.value}"`).join(sep);
	}

	static {
		Object.seal(GSAttr);
		globalThis.GSAttr = GSAttr;
	}
}


