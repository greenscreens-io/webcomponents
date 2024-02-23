/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSUtil } from "./GSUtil.mjs";

/**
 * A module loading GSAttr class
 * @module base/GSAttr
 */

/**
 * A generic set of static functions to handle DOM Attributes
 * @class
 */
export class GSAttr {

	/**
	 * Check if given element is of type HTMLElement
	 * NOTE: GSDOM.isHTMLElement duplicate - prevent circular import
	 * @returns {Boolean}
	 */
	static isHTMLElement(el) {
		return el instanceof HTMLElement;
	}

	/**
	  * Generic function to change element node attribute
	  * 
	  * @param {HTMLElement} el Target to receive attribute value
	  * @param {String} name Attribite name
	  * @param {Boolean} val Attribute value
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
	 * @param {String} name Attribite name
	 * @param {String} val Attribute value
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
	 * @param {String} name Attribute name
	 * @param {String} val Default value
	 * @returns {String}
	 */
	static get(el, name = '', val = '') {
		if (!GSAttr.isHTMLElement(el)) return val;
		if (!GSUtil.isInstance(el)) return undefined;
		const v = el.getAttribute(name) || val;
		return GSUtil.normalize(v);
	}

	/**
	 * Get attribute as boolean type
	 * 
	 * @param {HTMLElement} el Element containing attribute
	 * @param {String} name Attribute name
	 * @param {String} val Default value
	 * @returns {Boolean}
	 */
	static getAsBool(el, name = '', val = 'false') {
		const attr = GSAttr.get(el, name, val);
		return GSUtil.asBool(attr, val);
	}

	/**
	 * Get attribute as numberic type
	 * 
	 * @param {HTMLElement} el Element containing attribute
	 * @param {String} name Attribute name
	 * @param {String} val Default value
	 * @returns {Number}
	 */
	static getAsNum(el, name = '', val = '0') {
		const attr = GSAttr.get(el, name, val);
		return GSUtil.asNum(attr, val);
	}

	/**
	 * Get attribute as JSON object type
	 * 
	 * @param {HTMLElement} el Element containing attribute
	 * @param {String} name Attribute name
	 * @param {String} val Default value
	 * @returns {JSON}
	 */
	static getAsJson(el, name = '', val = '0') {
		const attr = GSAttr.get(el, name, val, {});
		return GSUtil.toJson(attr);
	}

	/**
	 * Store data into attribute as boolean
	 * @param {HTMLElement} el Element containing attribute
	 * @param {String} name Attribute name
	 * @param {Boolean} val Default value
	 */
	static setAsBool(el, name = '', val = 'false') {
		GSAttr.set(el, name, GSUtil.asBool(val), false);
		/*
		if (!GSAttr.isHTMLElement(el)) return;
		el.toggleAttribute(name, GSUtil.asBool(val));
		*/
	}

	/**
	 * Store data into attribute as numeric
	 * @param {HTMLElement} el Element containing attribute
	 * @param {String} name Attribute name
	 * @param {Number} val Default value
	 */
	static setAsNum(el, name = '', val = '0') {
		GSAttr.set(el, name, GSUtil.asNum(val), NaN);
	}

	/**
	 * Store data into attribute as JSON string
	 * @param {HTMLElement} el Element containing attribute
	 * @param {String} name Attribute name
	 * @param {string val Default value
	 */
	static setAsJson(el, name = '', val = '0') {
		GSAttr.set(el, name, JSON.stringify(val), '{}');
	}

	/**
	 * Convert JSON object to attribute string 
	 * @param {*} obj 
	 * @returns {String}
	 */
	static flattenJson(obj) {
		return Object.entries(obj || {}).map(kv => `${kv[0]}=${kv[1]}`).join(' ');
	}

	/**
	 * Apply JSON object to element attributes
	 * @param {*} obj 
	 */
	static jsonToAttr(obj, el) {
		if (!GSAttr.isHTMLElement(el)) return;
		Object.entries(obj || {}).map(kv => GSAttr.set(el, kv[0], kv[1]));
	}

	/**
	 * Convert list of data attributes into a string list
	 * @param {HTMLElement} el 
	 * @returns {String}
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

	/**
	 * Generic attribute retriever 
	 * opt format { prop: {type:Number, attribute: 'alt-prop-name'}}
	 * @returns {Proxy}
	 */
	static proxify(host, opt = {}, recursive = 'items') {

		const instance = new Proxy(host, {
			
			set(target, prop, value) {
				
				if (prop === 'self') return;
				if (prop === 'dataset') return target.dataset = value;

				const type = opt[prop]?.type;
				prop = opt[prop]?.attribute || prop;
				
				switch(type) {
					case Boolean :
						GSAttr.toggle(target, prop,  GSUtil.asBool(value));
						break;
					case Number :
						GSAttr.setAsNum(target, prop, value);
						break;
					case Object :
					case Array :
						GSAttr.set(target, prop, JSON.stringify(value));
					default:					
						GSAttr.set(target, prop, value);
						break;
				}

				return true;
			},

			get(target, prop) {
				
				if (prop === 'self') return target;
				if (prop === 'dataset') return target.dataset;
				if (typeof prop === 'symbol') return target[prop];
				if (prop === recursive) return Array.from(target.children).map(el => GSAttr.proxify(el, opt, recursive)); 


				const type = opt[prop]?.type;
				const safe = opt[prop]?.unsafe ? true : false;
				const dflt = opt[prop]?.default;
				const multi = opt[prop]?.multi === true;
				
				prop = opt[prop]?.attribute || prop;
				let val = GSAttr.get(target, prop);
				
				switch(type) {
					case Boolean :
						return target.hasAttribute(prop);
					case Number :
						return GSUtil.asNum(val, 0);
					case Object :
						return GSUtil.toJson(val, {});
					case Array :
						return GSUtil.toJson(val, []);
					default:					
						val = safe ? (val || dflt || '') : (val || dflt || undefined);
						return multi ? GSUtil.toStringArray(val) : val;
				}
			}
		});
		
		return instance;
	}

	static {
		Object.seal(GSAttr);
		globalThis.GSAttr = GSAttr;
	}
}
