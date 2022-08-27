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
	 * NOTE: GSDOM.isHTMLElement duplicate- p revent circualr import
	 * @returns {boolean}
	 */
	static isHTMLElement(el) {
		return el instanceof HTMLElement;
	}

	/**
	 * Generic function to change elment node attribute
	 * 
	 * @param {HTMLElement} el Target to receive attribute value
	 * @param {string} name Attribite name
	 * @param {string} val Attribute value
	 * @returns {void}
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
		return GSUtil.asBool(attr);
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
		return GSUtil.asNum(attr);
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
		return JSON.parse(attr);
	}

	static setAsBool(el, name = '', val = 'false') {
		return GSAttr.set(el, name, GSUtil.asBool(val), false);
	}

	static setAsNum(el, name = '', val = '0') {
		return GSAttr.set(el, name, GSUtil.asNum(val), NaN);
	}

	static setAsJson(el, name = '', val = '0') {
		return GSAttr.set(el, name, JSON.stringify(val), '{}');
	}

	/**
	 * Convert element data-* attributes into JSON object
	 * @param {HTMLElement} el 
	 * @returns {object}
	 */
	static getData(el) {
		const o = {}
		if (!GSAttr.isHTMLElement(el)) return o;
		Array.from(el.attributes)
			.filter(v => v.name.startsWith('data-'))
			.forEach(v => o[v.name.split('-')[1]] = v.value);
		return o;
	}

	/**
	 * Copy data attributes from one element to another
	 * @param {HTMLElement} source 
	 * @param {HTMLElement} target 
	 * @returns {boolean}
	 */
	static setData(source, target) {
		if (!GSAttr.isHTMLElement(source)) return false;
		if (!GSAttr.isHTMLElement(target)) return false;
		Array.from(source.attributes)
			.filter(v => v.name.startsWith('data-'))
			.forEach(v => GSAttr.set(target, v.name, v.value));
		return true;
	}

	/**
	 * Convert list of data attributes into a string list
	 * @param {HTMLElement} el 
	  @returns {string}
	 */
	static dataToString(el) {
		return Array.from(el.attributes)
			.filter(v => v.name.startsWith('data-'))
			.map(v => `${v.name}="${v.value}"`)
			.join(' ');
	}

	static {
		Object.seal(GSAttr);
	}
}


