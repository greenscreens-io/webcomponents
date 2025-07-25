/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSUtil class
 * @module base/GSUtil
 */

import { GSLog } from "./GSLog.mjs";

/**
 * A generic set of static functions used across GS WebComponents framework
 * @class
 */
export class GSUtil {

	static FLAT = globalThis.GS_FLAT == true;
	static ALPHANUM = /^[a-zA-Z0-9-_]+$/;
	static #JSON_NORMALIZE = /(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g;

	static isNumber = (n) => { return !isNaN(parseFloat(n)) && isFinite(n); };

	static isDate = (v) => { return v instanceof Date };

	static isBool = (v) => { return typeof v === 'boolean' || v instanceof Boolean };

	static isString = value => typeof value === 'string';

	static isNull = value => value === null || value === undefined;

	static toBinary = (value = 0) => value.toString(2);

	static asBool = (val = false) => {
		const v = GSUtil.normalize(val).toLowerCase();
		return v === 'true' || v === '1';
	};

	static fromLiteral = (str = '', obj) => str.replace(/\${(.*?)}/g, (x, g) => obj[g]);

	static reverse = (str) => (str || "").split("").reverse().join("");

	static capitalize = (word = '') => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '';

	static capitalizeAll = (word = '', split = ' ') => word.split(split).map((v, i) => GSUtil.capitalize(v)).join(split);

	static capitalizeAttr = (word = '') => word.split('-').map((v, i) => i ? GSUtil.capitalize(v) : v).join('');

	static initerror = () => { throw new Error('This class cannot be instantiated') };

	static isInstance = (el) => el instanceof el.constructor;

	static isPrimitive = (o) => !Array.isArray(o) && (this.isBool(o) || this.isDate(o) || this.isNumber(o) || this.isString(o));

	static range = (val = 0, min = 10, max = 100) => (Math.max(Math.min(max, val), min));

	static extractNumber = (val = '') => val.match(/[\d,\.]*\d/)?.[0];

	static nonNull = value => !GSUtil.isNull(value);

	static asArray(val) {
		return Array.isArray(val) ? val : [val];
	}

	static asNum(val, dft = 0, language) {
		language = language || GSUtil.language;
		if (GSUtil.isString(val)) {
			const sep = GSUtil.numberSeparator(language);
			val = GSUtil.extractNumber(val)?.replaceAll(sep, '') || val;
		}
		return GSUtil.isNumber(val) ? parseFloat(val) : dft;
	}


	/**
	 * Validate string for url format
	 * @param {String} url 
	 * @returns {Boolean}
	 */
	static isURL = (url = '') => /^(https?:\/\/|\/{1,2}|\.\/{1})(\S*\/*){1,}/i.test(url.trim());

	static isHTML = (val = '') => val.trim().startsWith('<') && val.trim().endsWith('>');

	/**
	 * Generate random set of characters
	 * @param {String} pattern 
	 * @param {String} charset 
	 * @returns {String}
	 */
	static generateUUID = (pattern = "xxxx-xxxx-xxxx-xxxx-xxxx", charset = "abcdef0123456789") => pattern.replace(/[x]/g, () => charset[Math.floor(Math.random() * charset.length)]);

	/**
	 * Get browser default language
	 * @returns {String}
	 */
	static get language() {
		return navigator.language ? navigator.language : navigator.languages[0];
	}

	/**
	 * Convert string to regex isntance
	 * @param {*} val 
	 * @param {*} flags 
	 * @returns 
	 */
	static toRegex(val, flags) {
		if (val instanceof RegExp) return val;
		return GSUtil.isStringEmpty(val) ? undefined : new RegExp(val, flags);
	}

	/**
	 * Find number separator for given language
	 * @param {string} language 
	 * @returns 
	 */
	static decimalSeparator(language) {
		return Intl.NumberFormat(language).format(1.1)[1];
	}

	/**
	 * Find decimal separator for given language
	 * @param {string} language 
	 * @returns 
	 */
	static numberSeparator(language) {
		return Intl.NumberFormat(language).format(1000)[1];
	}

	/**
	 * Try to find data format based on language
	 * @param {string} language 
	 * @returns 
	 */
	static getDateFormat(language = undefined) {
		const formatted = new Intl.DateTimeFormat(language).format(new Date(2000, 0, 2));
		return formatted
			.replace('2000', 'YYYY')
			.replace('01', 'MM')
			.replace('1', 'M')
			.replace('02', 'DD')
			.replace('2', 'D');
	}

	/**
	 * Sanitize text for HTML generation
	 * @param {string} string 
	 * @returns 
	 */
	static sanitize(string = '') {		
		const map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;',
			"/": '&#x2F;',
			"\n": '<br>',
			"\r": '<br>',
			"\t": '&nbsp;&nbsp;&nbsp;&nbsp;',
			' ': '&nbsp;',
			'\\': '&#x5C;',
			'`': '&#x60;'
		};
		const reg = new RegExp(`[${Object.keys(map).join('')}]`, 'ig');
		return string.replace(reg, (match) => (map[match]));
	}
		
	static isJsonString(val = '') {
		return typeof val == 'string' && (val.startsWith('{') || val.startsWith('['));
	}

	/**
	 * Check if provided parameter is of JSON type
	 * @param {String|object} val 
	 * @returns {Boolean}
	 */
	static isJsonType(val = '') {
		return !GSUtil.isNull(val) && (Array.isArray(val) || typeof val == "object");
	}

	/**
	 * Check if provided paramter is JSON
	 * @param {String|object} val 
	 * @returns {Boolean}
	 */
	static isJson(val = '') {
		return GSUtil.isJsonString(val) || GSUtil.isJsonType(val);
	}

	/**
	 * Convert provided paramter to JSON
	 * @param {String|object} val 
	 * @returns {Boolean}
	 */
	static toJson(val = '', dft = {}, normalize = true) {
		if (GSUtil.isJsonString(val)) return JSON.parse(normalize ? GSUtil.normalizeJson(val) : val);
		if (GSUtil.isJsonType(val)) return val;
		if (val) GSLog.warn(null, `Invalid data to convert into JSON: ${val}`);
		return dft;
	}

	/**
	 * Normalize unquoted JSON
	 * @param {String} val 
	 * @returns {String}
	 */
	static normalizeJson(val = '') {
		return val?.replace(GSUtil.#JSON_NORMALIZE, '"$2": ');
	}

	/**
	 * Makes string value safe, always return value
	 * @param {String|object} val 
	 * @returns {String}
	 */
	static normalize(val, def = '') {
		return (val ?? def).toString().trim();
	}

	/**
	 * Convert string separated values into an array
	 * @param {String} val 
	 * @param {String} separator 
	 * @returns {Array<String>}
	 */
	static toStringArray(val = '', separator = ' ') {
		return val.split(separator).map(v => v.trim()).filter(v => v.length > 0);
	}

	/**
	 * Transform text based on CSS text attribute format
	 * @param {String} format 
	 * @param {String} value 
	 * @returns {String}
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
	 * @param {String} tpl 
	 * @param {Object} params 
	 * @returns {function}
	 */
	static fromTemplateLiteral(tpl, params) {
		const names = Object.keys(params);
		const vals = Object.values(params);
		return new Function(...names, `return \`${tpl}\`;`)(...vals);
	}

	/**
	 * Decode HTML entities (&nbsp; &laquot; etc...)
	 * @param {string} text 
	 * @returns {string}
	 */
	static decodeHTMLEntities(text) {
		const textArea = document.createElement('textarea');
		textArea.innerHTML = text;
		return textArea.value;
	}

	/**
	 * Convert string pointer to object
	 * @param {String} value 
	 * @returns {*}
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
	 * @param {String} val 
	 * @returns {Boolean}
	 */
	static isStringNonEmpty(val = '') {
		return !GSUtil.isStringEmpty(val);
	}

	/**
	 * Check if strings is empty
	 * 
	 * @param {String} val 
	 * @returns {Boolean}
	 */
	static isStringEmpty(val = '') {
		return GSUtil.normalize(val).trim().length === 0;
	}

	/**
	 * match two strings, or first is not set
	 * 
	 * @param {String} left 
	 * @param {String} right 
	 * @returns {Boolean}
	 */
	static isStringMatch(left, right) {
		const lmatch = GSUtil.isStringNonEmpty(left);
		const rmatch = GSUtil.isStringNonEmpty(right);
		if (lmatch && rmatch) {
			return left.trim().toLowerCase() === right.trim().toLowerCase();
		}
		return lmatch === rmatch;		
	}

	/**
	 * Async version of timeout
	 * 
	 * @async
	 * @param {Number} time 
	 * @param {number|AbortSignal} signal Abort object
	 * @returns {Promise<void>}
	 */
	static async timeout(time = 0, signal) {
		if (time <= 0) return;
		signal = GSUtil.isNumber(signal) ? AbortSignal.timeout(signal) : signal;
		return new Promise((resolve, reject) => {
			const iid = setTimeout(resolve.bind(null, true), time);
			if (signal instanceof AbortSignal) {
				signal.addEventListener('abort', () => {
					clearTimeout(iid);
					reject(new Error('aborted timeout'));
				});
			}
		});
	}

	/**
	 * Download provided data
	 * 
	 * @async
	 * @param {Array} data 
	 * @param {String} name File name
	 * @param {String} type Mime type, default octet/stream
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
	 * @param {String} name Custom element name
	 * @param {HTMLElement} clazz Class extensing at least HTMLElement
	 * @param {String} ext If existing tag extended, this is tagName
	 * @param {Boolean} seal Should class be sealed
	 * @param {Boolean} freeze Should class be freezed
	 * @param {Boolean} expose Should class be exposed to "self"
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
	 * Import and initialize source in JavaScript modules
	 * Standard eval or new Function can not be used
	 * @param {String} src 
	 * @returns {*}
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

	/**
	 * Use Clipboard API to write to the clipboard
	 * @returns 
	 */
	static async writeToClipboard(value = '') {
		const result = await navigator.permissions.query({ name: "clipboard-write" })
		if (result.state === "granted" || result.state === "prompt") {
		   return navigator.clipboard.writeText(value);
		}
		return '';
	}

	/**
	 * Use Clipboard API to read from the clipboard
	 * @returns 
	 */
	static async readFromClipboard() {
		const result = await navigator.permissions.query({ name: "clipboard-read" })
		if (result.state === "granted" || result.state === "prompt") {
		   return navigator.clipboard.readText();
		}
		return '';
	}	

	static {
		Object.seal(GSUtil);
		globalThis.GSUtil = GSUtil;
	}
}