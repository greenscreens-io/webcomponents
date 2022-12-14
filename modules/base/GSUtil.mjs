/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSUtil class
 * @module base/GSUtil
 */

import GSLog from "./GSLog.mjs";

/**
 * A generic set of static functions used across GS WebComponents framework
 * @class
 */
export default class GSUtil {

	static #animating = 0;
	static FLAT = globalThis.GS_FLAT == true;
	static ALPHANUM = /^[a-zA-Z0-9-_]+$/;

	static isNumber = (n) => { return !isNaN(parseFloat(n)) && isFinite(n); };

	static isBool = (v) => { return typeof v === 'boolean' || v instanceof Boolean };

	static isString = value => typeof value === 'string';

	static isNull = value => value === null || value === undefined;

	static toBinary = (value = 0) => value.toString(2);

	static asNum = (val = 0, dft = 0) => GSUtil.isNumber(val) ? parseFloat(val) : dft;

	static asBool = (val = false) => val.toString().trim().toLowerCase() === 'true';

	static fromLiteral = (str = '', obj) => str.replace(/\${(.*?)}/g, (x, g) => obj[g]);

	static capitalize = (word = '') => word[0].toUpperCase() + word.slice(1).toLowerCase();

	static capitalizeAll = (word = '', split = ' ') => word.split(split).map((v, i) => GSUtil.capitalize(v)).join(split);

	static capitalizeAttr = (word = '') => word.split('-').map((v, i) => i ? GSUtil.capitalize(v) : v).join('');

	static initerror = () => { throw new Error('This class cannot be instantiated') };

	/**
	 * Validate string for url format
	 * @param {string} url 
	 * @returns {boolean}
	 */
	static isURL = (url = '') => /^(https?:\/\/|\/{1,2}|\.\/{1})(\S*\/*){1,}/i.test(url.trim());

	static isHTML = (val = '') => val.includes('<') && val.includes('>');

	/**
	 * Generate random set of characters
	 * @param {*} pattern 
	 * @param {*} charset 
	 * @returns 
	 */
	static generateUUID = (pattern = "xxxx-xxxx-xxxx-xxxx-xxxx", charset = "abcdef0123456789") => pattern.replace(/[x]/g, () => charset[Math.floor(Math.random() * charset.length)]);

	/**
	 * Get browser default locale
	 * @returns {string}
	 */
	static get locale() {
		return navigator.language ? navigator.language : navigator.languages[0];
	}

	static isJsonString(val = '') {
		return typeof val == 'string' && (val.startsWith('{') || val.startsWith('['));
	}

	/**
	 * Check if provided paramter is of JSON type
	 * @param {string|object} val 
	 * @returns {boolean}
	 */
	static isJsonType(val = '') {
		return Array.isArray(val) || typeof val == "object";
	}

	/**
	 * Check if provided paramter is JSON
	 * @param {string|object} val 
	 * @returns {boolean}
	 */
	static isJson(val = '') {
		return GSUtil.isJsonString(val) || GSUtil.isJsonType(val);
	}

	/**
	 * Convert provided paramter to JSON
	 * @param {string|object} val 
	 * @returns {boolean}
	 */
	static toJson(val = '') {
		if (GSUtil.isJsonString(val)) return JSON.parse(val);
		if (GSUtil.isJsonType(val)) return val;
		GSLog.warn(null, `Invalid data to convert into JSON: ${val}`);
		return null;
	}

	/**
	 * Makes string value safe, always return value
	 * @param {string|object} val 
	 * @returns {string}
	 */
	static normalize(val, def = '') {
		return (val ?? def).toString().trim();
	}

	/**
	 * Transform text based on CSS text attribute format
	 * @param {string} format 
	 * @param {string} value 
	 * @returns 
	 */
	static textTransform(format = '', value = '') {
		switch (format) {
			case 'lowercase':
				value = value.toLowerCase();
				break;
			case 'uppercase':
				value = value.toUpperCase();
				break;
			case 'capitalize':
				value = GSUtil.capitalizeAll(value);
				break;
		}
		return value;
	}

	/**
	 * Convert parameterized string literal as template to string 
	 * 
	 * 	 const template = 'Example text: ${text}';
	 *   const result = interpolate(template, {text: 'Foo Boo'});
	 * 
	 * @param {string} tpl 
	 * @param {Object} params 
	 * @returns {function}
	 */
	static fromTemplateLiteral(tpl, params) {
		const names = Object.keys(params);
		const vals = Object.values(params);
		return new Function(...names, `return \`${tpl}\`;`)(...vals);
	}

	/**
	 * Convert string pointer to object
	 * @param {string} value 
	 * @returns  {*}
	 */
	static parseValue(value) {
		if (!GSUtil.isString(value)) return;
		if (!GSUtil.isStringNonEmpty(value)) return;
		let o = window;
		let fn = null;
		value.trim().split('.').forEach((v, i, a) => {
			if (!o) return;
			if (i < a.length - 1) {
				return o = o[v];
			}
			fn = o[v];
		});
		return fn;
	}

	/**
	 * Check if strings has data
	 * 
	 * @param {string} val 
	 * @returns {boolean}
	 */
	static isStringNonEmpty(val = '') {
		return !GSUtil.isStringEmpty(val);
	}

	/**
	 * Check if strings is empty
	 * 
	 * @param {string} val 
	 * @returns {boolean}
	 */
	static isStringEmpty(val = '') {
		if (GSUtil.isString(val)) return val.trim().length === 0;
		return false;
	}

	/**
	 * match two strings, or first is not set
	 * 
	 * @param {string} left 
	 * @param {string} right 
	 * @returns {boolean}
	 */
	static isStringMatch(left, right) {
		const lmatch = GSUtil.isStringNonEmpty(left);
		const rmatch = GSUtil.isStringNonEmpty(right);
		if (lmatch && rmatch) {
			return left.trim().toLowerCase() == right.trim().toLowerCase();
		}
		return lmatch === rmatch;
	}

	/**
	 * Async version of timeout
	 * 
	 * @async
	 * @param {number} time 
	 * @returns {Promise<void>}
	 */
	static async timeout(time = 0) {
		return new Promise((r) => {
			setTimeout(r.bind(null, true), time);
		});
	}

	/**
	 * Modified animationFrame to prevent consequtive chained calls.
	 * 
	 * @param {function} callback 
	 * @returns {void}
	 */
	static requestAnimationFrame(callback) {
		if (typeof callback !== 'function') return;
		if (GSUtil.#animating > 0) return callback();
		GSUtil.#animating++;
		return globalThis.requestAnimationFrame(() => {
			try {
				callback();
			} catch (e) {
				console.log(e);
			} finally {
				GSUtil.#animating--;
			}
		});
	}

	/**
	 * Download provided data
	 * 
	 * @async
	 * @param {Array} data 
	 * @param {string} name File name
	 * @param {string} type Mime type, default octet/stream
	 */
	static async export(data, name, type = 'octet/stream') {

		const blob = new Blob(data, { type: type });
		const url = URL.createObjectURL(blob);
		try {
			const a = document.createElement("a");
			a.href = url;
			a.download = name;
			a.click();

			await GSUtil.timeout(2000);

		} finally {
			URL.revokeObjectURL(url);
		}
	}

	/**
	 * Registration helper function, replacement for class static initializers
	 * Mostly to support Safari browser.
	 * 
	 * GSUtil.register(null, GSUtil, null, true, false, true);
	 * 
	 * @param {string} name Custom element name
	 * @param {HTMLElement} clazz Class extensing at leas HTMLElement
	 * @param {string} ext If existing tag extended, this is tagName
	 * @param {boolean} seal Should class be sealed
	 * @param {boolean} freeze Should class be freezed
	 * @param {boolean} expose Should class be exposed to "self"
	 * 
	 * @returns {void}
	 */
	static register(name, clazz, ext, seal = true, freeze = false, expose = false) {
		if (!HTMLElement.isPrototypeOf(clazz)) return;
		if (customElements.get(name)) return;
		customElements.define(name, clazz, { extends: ext?.toLowerCase() });
		if (seal && !Object.isSealed(clazz)) Object.seal(clazz);
		if (freeze && !Object.isFrozen(clazz)) Object.freeze(clazz);
		if (expose) self[clazz.name] = clazz;
	}

	/**
	 * Inport and initialize source in JavaScript modules
	 * Standard eval or new Function can not be used
	 * @param {*} src 
	 * @returns 
	 */
	static async importSource(src) {
		const blob = new Blob([src], { type: "text/javascript" });
		const url = URL.createObjectURL(blob);
		try {
			return await import(url);
		} finally {
			URL.revokeObjectURL(url);
		}
	}

	static {
		Object.seal(GSUtil);
		globalThis.GSUtil = GSUtil;
	}
}