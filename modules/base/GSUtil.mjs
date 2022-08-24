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

	static FLAT = self.GS_FLAT == true;
	static ALPHANUM = /^[a-zA-Z0-9-_]+$/;

	static isNumber = (n) => { return !isNaN(parseFloat(n)) && isFinite(n); };

	static isString = value => typeof value === 'string';

	static isNull = value => value === null || value === undefined;

	static toBinary = (value = 0) => value.toString(2);

	static asNum = (val = 0) => GSUtil.isNumber(val) ? parseFloat(val) : 0;

	static asBool = (val = false) => val.toString().trim().toLowerCase() === 'true';

	static fromLiteral = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => obj[g]);

	static capitalize = (word) => word[0].toUpperCase() + word.slice(1).toLowerCase();

	static capitalizeAttr = (word) => word.split('-').map((v, i) => i ? GSUtil.capitalize(v) : v).join('');

	static initerror = () => { throw new Error('This class cannot be instantiated') };

	/**
	 * Validate string for url format
	 * @param {string} url 
	 * @returns {boolean}
	 */
	static isURL = (url = '') => /^(https?:\/\/|\/{1,2}|\.\/{1})(\S*\/*){1,}/i.test(url.trim());

	/**
	 * Get browser efautl locale
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
		return GSUtil.isString(val) ? val.trim() : (val || def).toString();
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
		if (!GSUtil.isStringNonEmpty(value)) return;
		const me = this;
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
	 * @param {number} time 
	 * @returns {void}
	 */
	static async timeout(time = 0) {
		return new Promise((r) => {
			setTimeout(r.bind(null, true), time);
		});
	}

	static {
		Object.seal(GSUtil);
		window.GSUtil = GSUtil;
	}
}

