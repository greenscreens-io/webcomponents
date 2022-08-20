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
 
	 // Timeout for removing element
	 static SPEED = 300;
 
	 static #loaded = false;
 
	 static TEMPLATE_URL = self.GS_TEMPLATE_URL || location.origin;
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
	  * Conver provided paramter to JSON
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
	 * Parse string into html DOM
	 *
	 * @param {string} html
	 * @param {string} mime
	 * @return {HTMLElement}
	 */
	 static parse(html = '', mime = 'text/html') {
		 try {
			 const parser = new DOMParser();
			 const doc = parser.parseFromString(html, mime);
			 return doc.body ? doc.body.firstElementChild : doc.firstElementChild;
		 } catch (e) {
			 GSLog.error(null, e);
			 throw e;
		 }
	 }
 
	 /**
	  * Convert partial URL to a real URL
	  * @param {string} url 
	  * @return {string}
	  */
	 static normalizeURL(url = '') {
 
		 url = url || '';
		 let path = null;
		 const isFile = location.pathname.split('/').pop(-1).indexOf('\.') > -1;
 
		 if (url.startsWith('http')) {
			 path = url;
		 } else if (url.startsWith('./')) {
			 path = `${location.origin}${location.pathname}/.${url}`;
		 } else if (url.startsWith('../')) {
			 path = `${location.origin}${location.pathname}/${url}`;
		 } else if (url.startsWith('/')) {
			 path = `${location.origin}${url}`;
		 } else if (location.href.endsWith('/')) {
			 path = `${location.origin}${location.pathname}/${url}`;
		 } else if (isFile) {
			 path = `${location.origin}${location.pathname}/../${url}`;
		 } else {
			 path = `${location.origin}${location.pathname}/${url}`;
		 }
 
		 return new URL(path.replaceAll('//', '/')).href;
	 }
 
	 /**
	  * Extrach aprent path from provided URL string
	  * @param {string} url 
	  * @param {number} level How many levels to go up the chain
	  * @returns {string}
	  */
	 static parentPath(url = '', level = 1) {
		 return (url || '').split('/').slice(0, -1 * level).join('/');
	 }
 
	 /**
	  * Used for override to get predefined template
	  * Can be html source or url, checks if load or not
	  * @param {string} def
	  * @return {string}
	  */
	 static async getTemplate(def = '') {
		 const isRef = def.startsWith('#');
		 if (isRef) {
			 const el = GSUtil.findEl(def);
			 return el ? el.innerHTML : def;
		 }
		 const isURL = GSUtil.isURL(def);
		 return isURL ? GSUtil.loadSafe(def) : def;
	 }
 
	 /**
	  * Decode template URL into a real URL
	  * @param {string} url 
	  * @return {string}
	  */
	 static getTemplateURL(url = '') {
 
		 if (url.startsWith('//')) {
			 return GSUtil.normalizeURL(GSUtil.templateURL + url);
		 }
 
		 return GSUtil.normalizeURL(url);
	 }
 
	 /**
	  * Retrieve default template url
	  * @return {string}
	  */
	 static get templateURL() {
		 return GSUtil.normalizeURL(GSUtil.templatePath);
	 }
 
	 /**
	  * Retrieve defult tempalte path
	  * @return {string}
	  */
	 static get templatePath() {
		 return GSUtil.TEMPLATE_URL ? GSUtil.TEMPLATE_URL.replace('//', '/') : '';
	 }
 
	 /**
	  * Load remote data as text (for loading templates)
	  * 
	  * @param {string} val Full or partial url path
	  * @param {string} method HTTP methog get|put|post
	  * @param {boolean} asjson Parse returned data as JSON
	  * @returns {object|string}
	  */
	 static async load(val = '', method = 'GET', asjson = false) {
		 let data = null;
		 const url = GSUtil.getTemplateURL(val);
		 const res = await fetch(url, { method: method });
		 if (res.ok) data = asjson ? await res.json() : await res.text();
		 return data;
	 }
 
	 /**
	  * Load remote data without throwing an exception
	  * @param {*} url Full or partial url path
	  * @param {*} method http method GET|POST|PUT
	  * @param {*} asjson return json or string
	  * @param {*} dft default value
	  * @returns {object|string}
	  */
	 static async loadSafe(url = '', method = 'GET', asjson = false, dft) {
		 try {
			 return GSUtil.load(url, method, asjson);
		 } catch (e) {
			 GSLog.error(this, e);
		 }
		 if (dft) return dft;
		 return asjson ? {} : '';
	 }
 
 
	 /**
	  * Load data from various sources
	  * @param {JSON|func|url} val 
	  */
	 static async loadData(val = '') {
		 const isJson = GSUtil.isJson(val);
		 const func = !isJson && GSUtil.parseFunction(val);
		 const isFunc = GSUtil.isFunction(func);
		 const isData = !isFunc && GSUtil.parseValue(val);
 
		 if (isData || isJson) val = GSUtil.toJson(val);
 
		 if (isFunc) {
			 const isAsync = GSUtil.isFunctionAsync(func);
			 if (isAsync) {
				 val = await GSUtil.callFunctionAsync(func, this);
			 } else {
				 val = GSUtil.callFunction(func);
			 }
		 }
 
		 if (!GSUtil.isJsonType(val)) return;
 
		 return val;
	 }
 
	 /** 
	  * Check if page is inside desktop
	  * @returns {boolean}
	  */
	 static isDesktop() {
		 return !GSUtil.isMobile();
	 }
 
	 /**
	  * Check if page is inside mobile device
	  * @returns {boolean}
	  */
	 static isMobile() {
		 if (navigator.userAgentData) return navigator.userAgentData.mobile;
		 return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	 }
 
	 /**
	  * Check if value match current browser type
	  * @param {string} val 
	  * @returns {boolean}
	  */
	 static isValidBrowser(val = '') {
		 if (!val) return true;
		 const strVal = val.toLowerCase();
		 if (navigator.userAgentData) {
			 let sts = false;
			 navigator.userAgentData.brands.forEach((v) => {
				 if (v.brand.toLowerCase().indexOf(strVal) > -1) {
					 sts = true;
				 }
			 });
			 return sts;
		 }
		 const strAgt = navigator.userAgent.toLocaleLowerCase();
		 const isEdge = strAgt.indexOf('edg') > 0;
		 if (isEdge && strVal.startsWith('edg')) return true;
		 return !isEdge && strAgt.indexOf(strVal) > 0;
	 }
 
	 /**
	  * Returns if environment matched
	  * dektop, mobile, tablet, android, linux, winwdows, macos
	  * @returns {boolean}
	  */
	 static isValidEnvironment(val = '') {
 
		 if (!val) return true
 
		 if (val === 'desktop') {
			 return GSUtil.isDesktop();
		 }
 
		 if (val === 'mobile') {
			 return GSUtil.isMobile();
		 }
 
		 return GSUtil.isDevice(val);
	 }
 
	 /**
	  * Returns true if device /os is valid
	  * @param {string} val 
	  * @returns {boolean}
	  */
	 static isDevice(val = '') {
		 if (!val) return true;
		 const strVal = val.toLowerCase();
 
		 if (navigator.userAgentData && navigator.userAgentData.platform) {
			 const platform = navigator.userAgentData.platform.toLowerCase();
			 return platform === strVal;
		 }
 
		 const strAgt = navigator.userAgent.toLocaleLowerCase();
		 return strAgt.indexOf(strVal) > 1;
	 }
 
	 /**
	  * Returns if orientation matched
	  * horizontal, vertical, portrait, landscape
	  * retuns true if value not set
	  * 
	  * @param {string} val
	  * @returns {boolean}
	  */
	 static isValidOrientation(val = '') {
 
		 if (!val) return true;
 
		 if (!screen.orientation) return true;
 
		 const otype = screen.orientation.type;
 
		 if (otype.indexOf('portrait') > -1) {
			 return val === 'portrait' || val === 'vertical';
		 }
 
		 if (otype.indexOf('landscape') > -1) {
			 return val === 'landscape' || val === 'horizontal';
		 }
 
		 return true;
	 }
 
	 /**
	   * Check if given element is of given type 
	   * 
	   * @param {HTMLElement} el
	   * @param {string|class} type
	   * @returns {boolean}
	   */
	 static isElement(el, type) {
		 if (type && el) {
			 if (typeof type === 'string') {
				 if (type.toUpperCase() === el.tagName) return el;
			 } else if (el instanceof type) return el;
		 }
		 return false;
	 }
 
	 /**
	  * Check if given element is of type HTMLElement
	  * @returns {boolean}
	  */
	 static isTemplateElement(el) {
		 //return el instanceof HTMLTemplateElement && el.content && el.content.firstElementChild;
		 return el instanceof HTMLTemplateElement;
	 }
 
	 /**
	  * Check if given element is of type HTMLElement
	  * @returns {boolean}
	  */
	 static isHTMLElement(el) {
		 return el instanceof HTMLElement;
	 }
 
	 /**
	  * Check if given element is of type SVGElement
	  * @returns {boolean}
	  */
	 static isSVGElement(el) {
		 return el instanceof SVGElement;
	 }
 
	 /*
	  * Check if given element is of type GSElement
	  */
	 static isGSElement(el) {
		 if (!GSUtil.isHTMLElement(el)) return false;
		 // return el instanceof GSElement || el instanceof GSTemplate
		 return el.tagName.indexOf('GS-') === 0;
	 }
 
	 /**
	  * Check if standard element extended with GS
	  * @param {HTMLElement} el 
	  * @returns {boolean}
	  */
	 static isGSExtra(el) {
		 if (!GSUtil.isHTMLElement(el)) return false;
		 return GSUtil.getAttribute(el, 'is', '').indexOf('gs-') === 0;
	 }
 
	 /**
	  * Get all child GSElement	
	  * @param {HTMLElement} el 
	  * @returns {Array<HTMLElement>}
	  */
	 static getChilds(el) {
		 if (!GSUtil.isHTMLElement(el)) return [];
		 return Array.from(el.childNodes).filter(e => GSUtil.isGSElement(e));
	 }
 
	 /**
	  * Hide html element
	  * @param {HTMLElement} el 
	  * @param {boolean} orientation 
	  * @returns {void}
	  */
	 static hide(el, orientation = false) {
		 if (!GSUtil.isHTMLElement(el)) return;
		 const css = orientation ? 'gs-hide-orientation' : 'gs-hide';
		 el.classList.add(css);
	 }
 
	 /**
	  * Show html element
	  * @param {HTMLElement} el 
	  * @param {boolean} orientation 
	  * @returns {booelan}
	  */
	 static show(el, orientation = false) {
		 if (!GSUtil.isHTMLElement(el)) return;
		 const css = orientation ? 'gs-hide-orientation' : 'gs-hide';
		 return el.classList.remove(css);
	 }
 
	 /**
	  * Add node as next in list of nodes
	  * @param {HTMLElement} target 
	  * @param {HTMLElement} newEl 
	  * @returns {boolean}
	  */
	 static addSibling(target, newEl) {
		 const injectable = GSUtil.isHTMLElement(newEl) || GSUtil.isSVGElement(newEl);
		 const isOK = GSUtil.isHTMLElement(target) && injectable;
		 return isOK ? target.parentNode.insertBefore(newEl, target.nextElementSibling) : false;
	 }
 
	 /**
	  * Add child node to a target
	  * @param {HTMLElement} target 
	  * @param {HTMLElement} newEl 
	  * @returns {boolean}
	  */
	 static appendChild(target, newEl) {
		 const isok = GSUtil.isHTMLElement(target) && GSUtil.isHTMLElement(newEl);
		 return isok ? target.appendChild(newEl) : false;
	 }
 
	 /**
	  * Remove genreated componnt from parent
	  * @param {HTMLElement} el 
	  * @returns {boolean}
	  */
	 static removeElement(el) {
		 const isOk = GSUtil.isHTMLElement(el) && el.parentNode;
		 return isOk ? el.parentNode.removeChild(el) : false;
	 }
 
	 /**
	  * Find element by css selector from given context or return default element
	  * 
	  * @param {HTMLElement} ctx 
	  * @param {string} val CSS query selector
	  * @param {HTMLElement} def Default element
	  * @returns {HTMLElement}
	  */
	 static findElement(ctx, val = '', def = null) {
		 if (!val) return def;
		 if (!GSUtil.isHTMLElement(ctx)) return def;
		 try {
			 return ctx.querySelector(val) || def;
		 } catch (e) {
			 GSLog.error(ctx, e);
		 }
		 return def;
	 }
 
	 /**
	  * Walk node tree
	  * @param {HTMLLegendElement} rootEL 
	  * @param {function} callback 
	  * @returns {boolean}
	  */
	 static walk(rootEL, callback) {
		 if (typeof callback !== 'function') return false;
		 callback(rootEL);
		 rootEL.childNodes.forEach(el => GSUtil.walk(el, callback));
		 return true;
	 }
 
	 /**
	  * Get parent element
	  * @param {HTMLElement} el 
	  * @returns {HTMLElement}
	  */
	 static parent(el) {
		 return el ? (el.parentElement || el.parentNode || el.host) : null;
	 }
 
	 /**
	  * Parent element iterator
	  * @param {HTMLElement} el 
	  * @returns {HTMLElement}
	  * @iterator
	  */
	 static *parentAll(el) {
		 let e = GSUtil.parent(el);
		 while (e) {
			 yield e;
			 e = GSUtil.parent(e);
		 }
		 return yield e;
	 }
 
	 /**
	  * Get root element whch might be shadow root, GSElelement, any parent element
	  * @param {HTMLElement} el 
	  * @returns {HTMLElement|ShadowRoot}
	  */
	 static getRoot(el) {
		 if (!el) return null;
 
		 const it = GSUtil.parentAll(el);
		 for (let v of it) {
			 if (v instanceof ShadowRoot) return v;
			 if (v instanceof HTMLBodyElement) return v;
		 }
 
		 return null;
	 }
 
	 /**
	  * Set html text to provided element
	  * @param {HTMLElement} el 
	  * @param {string} val 
	  * @returns {void}
	  */
	 static setHTML(el, val = '') {
		 if (!GSUtil.isHTMLElement(el)) return;
		 el.innerHTML = val;
	 }
 
	 /**
	  * Set text to provided element
	  * @param {HTMLElement} el 
	  * @param {string} val 
	  * @returns {void}
	  */
	 static setText(el, val = '') {
		 if (!GSUtil.isHTMLElement(el)) return;
		 el.innerText = val;
	 }
 
	 /**
	  * Generic function to change elment node attribute
	  * 
	  * @param {HTMLElement} el Target to receive attribute value
	  * @param {string} name Attribite name
	  * @param {string} val Attribute value
	  * @returns {void}
	  */
	 static setAttribute(el, name, val) {
		 if (!GSUtil.isHTMLElement(el)) return;
		 if (val != null) {
			 el.setAttribute(name, val);
		 } else {
			 el.removeAttribute(name);
		 }
	 }
 
	 /**
	  * Generic function to get element node attribute
	  * 
	  * @param {HTMLElement} el 
	  * @param {string} name 
	  * @param {string} val 
	  * @returns {boolean}
	  */
	 static getAttribute(el, name = '', val = '') {
		 if (!GSUtil.isHTMLElement(el)) return val;
		 const v = el.getAttribute(name) || val;
		 return GSUtil.isString(v) ? v.trim() : v;
	 }
 
	 static getAttributeAsBool(el, name = '', val = 'false') {
		 return GSUtil.asBool(GSUtil.getAttribute(el, name, val));
	 }
 
	 static getAttributeAsNum(el, name = '', val = '0') {
		 return GSUtil.asNum(GSUtil.getAttribute(el, name, val));
	 }
 
	 static getAttributeAsJson(el, name = '', val = '0') {
		 return JSON.parse(GSUtil.getAttribute(el, name, val, {}));
	 }
 
	 static setAttributeAsBool(el, name = '', val = 'false') {
		 return GSUtil.setAttribute(el, name, GSUtil.asBool(val), false);
	 }
 
	 static setAttributeAsNum(el, name = '', val = '0') {
		 return GSUtil.setAttribute(el, name, GSUtil.asNum(val), NaN);
	 }
 
	 static setAttributeAsJson(el, name = '', val = '0') {
		 return GSUtil.setAttribute(el, name, JSON.stringify(val), '{}');
	 }
 
	 /**
	  * Safe way to toggle CSS class on element, multipel classes are supported in space separated string list
	  * @param {HTMLElement} el 
	  * @param {boolean} sts Ture to add, false to remove
	  * @param {*} val list of css classes in spaec separated string
	  * @returns {boolean}
	  */
	 static toggleClass(el, sts = true, val = 'd-none') {
		 if (!GSUtil.isHTMLElement(el)) return false;
		 if (!val || val.trim().length == 0) return false;
		 val = val.split(' ').filter(v => v && v.trim().length > 0);
		 if (sts === null) return val.forEach(v => el.classList.toggle(v));
		 sts ? el.classList.add.apply(el.classList, val) : el.classList.remove.apply(el.classList, val);
	 }
 
	 /**
	  * Checks if element contains a css class
	  * @param {HTMLElement} el 
	  * @param {string} val 
	  * @returns {boolean}
	  */
	 static hasClass(el, val = '') {
		 if (!GSUtil.isHTMLElement(el)) return false;
		 return el.classList.contains(val);
	 }
 
	 /**
	  * Search for named slot tag or css selector 
	  * @param {HTMLElement} own 
	  * @param {string} name Tagged slot  name
	  * @param {*} qry CSS selector
	  * @param {*} multi true to return array or false for a single element
	  * @returns {HTMLElement|Array<HTMLElement>}
	  */
	 static findSlotOrEl(own, name = '', qry = '', multi = false) {
		 const fn = multi ? 'querySelectorAll' : 'querySelector';
		 if (!(own && own[fn])) return multi ? [] : null;
		 const el = name ? own[fn](`[slot="${name}"]`) : null;
		 if (el) return el;
		 if (!el && own.shadowRoot) return own.shadowRoot[fn](qry);
		 return own[fn](qry);
	 }
 
	 /**
	  * Check if object has function
	  * 
	  * @param {object} o 
	  * @param {function} fn 
	  * @returns {boolean}
	  */
	 static hasFunction(o, fn) {
		 return o && GSUtil.isFunction(o[fn]);
	 }
 
	 /**
	  * Check if object is of type function
	  * 
	  * @param {function} fn 
	  * @returns {boolean}
	  */
	 static isFunction = (fn) => typeof fn === 'function';
 
	 /**
	  * Check if object is of type async function
	  * 
	  * @param {function} fn 
	  * @returns  {boolean}
	  */
	 static isFunctionAsync(fn) {
		 if (!GSUtil.isFunction(fn)) return false;
		 const AsyncFunction = GSUtil.callFunctionAsync.constructor
		 let isValid = fn instanceof AsyncFunction;
		 if (!isValid) isValid = fn[Symbol.toStringTag] == "AsyncFunction";
		 return isValid;
	 }
 
	 /**
	  * Generic asynchronous function caller
	  * 
	  * @param {function} fn 
	  * @param {object} owner 
	  * @returns  {Promise}
	  * @throws {Error} 
	  */
	 static async callFunctionAsync(fn, owner) {
		 try {
			 return await fn(owner);
		 } catch (e) {
			 return e;
		 }
	 }
 
	 /**
	  * Generic synchronous function caller
	  * 
	  * @param {function} fn 
	  * @param {object} owner 
	  * @returns {object}
	  * @throws {Error}
	  */
	 static callFunctionSync(fn, owner) {
		 try {
			 return fn(owner);
		 } catch (e) {
			 return e;
		 }
	 }
 
	 /**
	  * Generic function caller
	  * 
	  * @param {function} fn 
	  * @param {object} owner 
	  * @returns {object}
	  */
	 static callFunction(fn, owner) {
		 if (!GSUtil.isFunction(fn)) return;
		 if (GSUtil.isFunctionAsync(fn)) {
			 return GSUtil.callFunctionAsync(fn, owner);
		 }
		 return GSUtil.callFunctionSync(fn, owner);
	 }
 
	 /**
	  * Convert string pointer to function call
	  * 
	  * @param {string} value 
	  * @returns  {function}
	  */
	 static parseFunction(value) {
		 const fn = GSUtil.parseValue(value);
		 return GSUtil.isFunction(fn) ? fn : null;
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
	  * Generic prevent event bubling
	  * 
	  * @param {Event} e 
	  */
	 static preventEvent(e) {
		 if (GSUtil.hasFunction(e, 'preventDefault')) e.preventDefault();
		 if (GSUtil.hasFunction(e, 'stopPropagation')) e.stopPropagation();
	 }
 
	 /**
	  * Generic event disaptcher
	  * 
	  * @param {HTMLElement} sender element that send event
	  * @param {string} name  Event name oto trigger
	  * @param {object} obj Data object to send 
	  * @param {boolean} bubbles Send event to parent
	  * @param {boolean} composed Send event across shadowDom
	  * @param {boolean} cancelable Event is cancelable
	  * @returns {boolean}
	  */
	 static sendEvent(sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		 const event = new CustomEvent(name, { detail: obj, bubbles: bubbles, composed: composed, cancelable: cancelable });
		 return sender.dispatchEvent(event);
	 }
 
	 /** 
	  * Generic event disaptcher in suspended rendering
	  * 
	  * @param {HTMLElement} sender element that send event
	  * @param {string} name  Event name oto trigger
	  * @param {object} obj Data object to send 
	  * @param {boolean} bubbles Send event to parent
	  * @param {boolean} composed Send event across shadowDom
	  * @param {boolean} cancelable Event is cancelable
	  * @returns {void} 
	  */
	 static sendSuspendedEvent(sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		 if (!name) return;
		 requestAnimationFrame(() => {
			 GSUtil.sendEvent(sender, name, obj, bubbles, composed, cancelable);
		 });
	 }
 
	 /**
	  * Check if two arrays are equal
	  * 
	  * @param {*} a 
	  * @param {*} b 
	  * @returns {boolean}
	  */
	 static arraysEqual(a, b) {
 
		 if (a === b) return true;
		 if (!Array.isArray(a)) return false;
		 if (!Array.isArray(b)) return false;
 
		 a.sort();
		 b.sort();
 
		 for (var i = 0; i < a.length; ++i) {
			 if (a[i] !== b[i]) return false;
		 }
 
		 return true;
	 }
 
	 /**
	  * Check if two strings are arrays and equal
	  * 
	  * @param {string} left 
	  * @param {string} right 
	  * @param {string} sep 
	  * @returns {boolean}
	  */
	 static isStringArrayMatch(left, right, sep) {
		 if (typeof left !== 'string') return false;
		 if (typeof right !== 'string') return false;
		 const la = left.trim().toLowerCase().split(sep);
		 const ra = right.trim().toLowerCase().split(sep);
		 return GSUtil.arraysEqual(la, ra);
	 }
 
	 /**
	  * match if strings ha data
	  * 
	  * @param {string} val 
	  * @returns {boolean}
	  */
	 static isStringNonEmpty(val = '') {
		 if (typeof val === 'string') return val.trim().length > 0;
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
	  * Valiadte string for url format
	  * @param {string} url 
	  * @returns {boolean}
	  */
	 static isURL(url = '') {
		 return /^(https?:\/\/|\/{1,2}|\.\/{1})(\S*\/*){1,}/i.test(url.trim());
	 }
 
	 /**
	  * Disable browser console and default context menu
	  */
	 static protect() {
		 window.addEventListener('contextmenu', (e) => {
			 GSUtil.preventEvent(e);
		 });
 
		 document.addEventListener('keydown', (event) => {
			 const code = event.code;
			 if (code == 'F12') { // Prevent F12
				 return false;
			 } else if (event.ctrlKey && event.shiftKey && code == 'KeyI') { // Prevent Ctrl+Shift+I
				 return false;
			 }
		 });
	 }
 
	 /**
	  * Wai for web page to competely load
	  * @param {HTMLElement} target 
	  * @param {string} name 
	  * @param {function} callback 
	  * @param {number} timeout 
	  */
	 static async waitPageLoad(target, name = 'loaded', callback, timeout = 100) {
		 if (!GSUtil.#loaded) await GSUtil.waitEvent(window, 'load'); // DOMContentLoaded
		 GSUtil.#loaded = true;
		 await GSUtil.timeout(timeout);
		 GSUtil.callFunction(callback);
		 GSUtil.sendSuspendedEvent(target, name);
	 }
 
	 /**
	  * Alternative way to clear fields instead of form.reset()
	  * @param {HTMLElement} owner 
	  * @param {string} qry 
	  */
	 static clearInputs(owner, qry = 'input, textarea') {
		 const root = GSUtil.unwrap(owner);
		 requestAnimationFrame(() => {
			 root.querySelectorAll(qry).forEach((el) => el.value = '');
		 });
	 }
 
	 /**
	  * Convert element data-* attributes into JSON object
	  * @param {HTMLElement} el 
	  * @returns {object}
	  */
	 static getDataAttrs(el) {
		 const o = {}
		 if (!GSUtil.isHTMLElement(el)) return o;
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
	 static setDataAttrs(source, target) {
		 if (!GSUtil.isHTMLElement(source)) return false;
		 if (!GSUtil.isHTMLElement(target)) return false;
		 Array.from(source.attributes)
			 .filter(v => v.name.startsWith('data-'))
			 .forEach(v => GSUtil.setAttribute(target, v.name, v.value));
		 return true;
	 }
 
	 /**
	  * Convert list of data attributes into a string list
	  * @param {HTMLElement} el 
	   @returns {string}
	  */
	 static dataAttrsToString(el) {
		 return Array.from(el.attributes)
			 .filter(v => v.name.startsWith('data-'))
			 .map(v => `${v.name}="${v.value}"`)
			 .join(' ');
	 }
 
	 /**
	  * Get value from form element
	  * @param {HTMLElement} el 
	  * @returns {string}
	  */
	 static toValue(el) {
		 if (!GSUtil.isHTMLElement(el)) return undefined;
		 let value = el.value;
		 if ('text' === el.type) {
			 const map = el.computedStyleMap().get('text-transform');
			 if (map) {
				 if ('lowercase' == map.value) value = el.value.toLowerCase();
				 if ('uppercase' == map.value) value = el.value.toUpperCase();
			 }
		 }
		 return value;
	 }
 
	 /**
	  * Convert form elements into JSON object
	  * @param {HTMLElement} owner 
	  * @param {string} qry 
	  * @param {boolean} hidden 
	  * @returns {object}
	  */
	 static toObject(owner, qry = 'input, textarea, select', hidden = false) {
		 const root = GSUtil.unwrap(owner);
		 const params = {};
		 root.querySelectorAll(qry).forEach(el => {
			 if (!el.name) return;
			 if (!hidden && GSUtil.getAttribute(el, 'data-ignore') === 'true') return;
			 params[el.name] = GSUtil.toValue(el);
		 });
		 return params;
	 }
 
	 /**
	  * Convert URL hash key/value to form elements
	  * @param {HTMLElement} owner 
	  */
	 static fromURLHashToForm(owner) {
		 location.hash.slice(1).split('&').every((v) => {
			 if (v.length < 2) return true;
			 const d = v.split('=');
			 GSUtil.setValue(`input[name=${d[0]}]`, d[1], owner);
			 return true;
		 });
	 }
 
	 /**
	  * Return element shadowRoot or self
	  * @param {HTMLElement} owner 
	  * @returns {HTMLElement|shadowRoot}
	  */
	 static unwrap(owner) {
		 if (!owner) return document;
		 return GSUtil.isGSElement(owner) ? owner.shadowRoot : owner;
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
 
	 /**
	  * Async version of animation frame
	  * @param {function} callback 
	  * @returns {void}
	  */
	 static async waitAnimationFrame(callback) {
		 return new Promise((r, e) => {
			 requestAnimationFrame(() => {
				 try {
					 r();
					 if (typeof callback === 'function') callback();
				 } catch (er) {
					 e(er);
				 }
			 });
		 });
	 }
 
	 /**
	  * Get element by id, searcing down owner element as root
	  * @param {string} name 
	  * @param {HTMLElement} own 
	  * @returns {HTMLElement}
	  */
	 static getEl(name, own) {
		 if (!name) return null;
		 return GSUtil.findEl(`#${name}`, own);
	 }
 
	 /**
	  * Find element by css selector, searching down owner element as root
	  * @param {string} name 
	  * @param {HTMLElement} own 
	  * @returns {HTMLElement}
	  */
	 static findEl(name, own) {
		 if (!name) return null;
		 return (own || document).querySelector(name);
	 }
 
	 /**
	  * Find all elements by css selector, searching down owner element as root
	  * @param {string} name 
	  * @param {HTMLElement} own 
	  * @param {boolean} asArray 
	  * @returns {Array<HTMLElement>|NodeList} 
	  */
	 static findAll(name, own, asArray = false) {
		 if (!name) return null;
		 const list = (own || document).querySelectorAll(name);
		 return asArray ? Array.from(list) : list;
	 }
 
	 /**
	  * 
	  * @param {*} own 
	  * @param {*} qry 
	  * @param {*} event 
	  * @param {*} callback 
	  * @param {*} opt 
	  * @returns {boolean|Array<boolean>} 
	  */
	 static listen(own, qry, event, callback, opt = false) {
		 if (!qry && own) return own.addEventListener(event, callback, opt);
		 return GSUtil.findAll(qry, own).map(el => el.addEventListener(event, callback, opt));
	 }
 
	 /**
	  * 
	  * @param {*} own 
	  * @param {*} qry 
	  * @param {*} event 
	  * @param {*} callback 
	  * @returns {boolean|Array<boolean>} 
	  */
	 static unlisten(own, qry, event, callback) {
		 if (!qry && own) return own.removeEventListener(event, callback);
		 return GSUtil.findAll(qry, own).map(el => el.removeEventListener(event, callback));
	 }
 
	 /**
	  * 
	  * @param {*} own 
	  * @param {*} qry 
	  * @param {*} event 
	  * @param {*} callback 
	  * @returns {boolean}
	  */
	 static once(own, qry, event, callback) {
		 return GSUtil.listen(own, qry, event, callback, { once: true });
	 }
 
	 /**
	  * Async version of event listener
	  * @param {*} own 
	  * @param {*} name 
	  * @returns {Promise}
	  */
	 static waitEvent(own, name = '') {
		 const me = this;
		 return new Promise((r, e) => {
			 if (!name) return e('Event undefined!');
			 GSUtil.once(own, null, name, (e) => r(e.detail));
		 });
	 }
 
	 /**
	  * Enable input on all input elements under provided owner
	  * @param {string} qry Default to form
	  * @param {HTMLElement} own 
	  */
	 static enableInput(qry = 'form', own) {
		 const root = GSUtil.findEl(qry, own);
		 if (root) GSUtil.findAll('input, select, .btn', own).forEach(el => el.removeAttribute('disabled'));
	 }
 
	 /**
	  * Disable input on all input elements under provided owner
	  * @param {string} qry Default to form
	  * @param {HTMLElement} own 
	  */
	 static disableInput(qry = 'form', own) {
		 const root = GSUtil.findEl(qry, own);
		 if (root) GSUtil.findAll('input, select, .btn', el).forEach(el => el.setAttribute('disabled', true));
	 }
 
	 /**
	  * Set html content to a element by css selector
	  * @param {string} qry 
	  * @param {string} val 
	  * @param {HTMLElement} own 
	  */
	 static setHTML(qry, val, own) {
		 const el = UI.findEl(qry, own);
		 if (el) el.innerHTML = val;
	 }
 
	 /**
	  * Set value to a element by css selector
	  * @param {string} qry 
	  * @param {string} val 
	  * @param {HTMLElement} own 
	  */
	 static setValue(qry, val, own) {
		 const el = UI.findEl(qry, own);
		 if (el) el.value = val;
	 }
 
	 /**
	  * Find text nodes
	  * @param {HTMLElement} el 
	  * @returns {Array<string>}
	  */
	 static textNodesUnder(el) {
		 const walk = document.createTreeWalker(el || document, NodeFilter.SHOW_TEXT, null, false);
		 const a = [];
		 let n;
		 while (n = walk.nextNode()) a.push(n);
		 return a;
	 }
 
	 /**
	  * Remove invalid text characters from html element nodes
	  * @param {HTMLElement} root 
	  */
	 static cleanHTML(root) {
		 const ts = GSUtil.textNodesUnder(root || document).filter(t => t.wholeText.trim().length === 0);
		 ts.filter(el => el.nextSibling instanceof Text).forEach(el => el.remove());
		 ts.forEach(t => t.nodeValue = t.wholeText.replaceAll(/\u0020{4}/g, '\t').replaceAll(/(\n*\t*)*(?=\n\t*)/g, ''));
	 }
 
	 /**
	  * Rmoves duplicates from list
	  * @param {Array} data 
	  * @returns {Array}
	  */
	 static uniqe(data) {
		 return Array.from(new Set(data));
	 }
 
	 /**
	  * Simple array merge, without duplicates. Used by observableAttributes
	  * @param {Array} first 
	  * @param {Array} second 
	  * @returns {Array}
	  */
	 static mergeArrays(first = [], second = []) {
		 return first.concat(second).filter((value, index, self) => self.indexOf(value) === index);
	 }
 
 
	 static filterData(filter, data) {
		 const me = this;
		 return filter.length === 0 ? data : data.filter(rec => GSUtil.filterRecord(rec, filter));
	 }
 
	 static filterRecord(rec, filter) {
		 const me = this;
		 const isSimple = typeof filter === 'string';
		 return isSimple ? GSUtil.filterSimple(rec, filter) : GSUtil.filterComplex(rec, filter);
	 }
 
	 static filterSimple(rec, filter) {
		 for (let value of Object.values(rec)) {
			 if (value.toLowerCase().indexOf(filter) > -1) return true;
		 }
		 return false;
	 }
 
	 static filterComplex(rec, filter) {
		 let found = true;
		 for (let flt of filter) {
			 found = found && rec.hasOwnProperty(flt.name) && rec[flt.name].indexOf(flt.value) > -1;
			 if (!found) break;
		 }
 
		 return found;
	 }
 
	 static sortData(sort, data) {
		 if (sort.length === 0) return data;
		 return data.sort((a, b) => GSUtil.sortPair(a, b, sort));
	 }
 
	 static sortPair(a, b, sort) {
		 const me = this;
		 const isArray = Array.isArray(a);
		 let sts = 0;
 
		 sort.forEach((o, i) => {
			 if (!o) return;
			 const idx = o.col || i;
			 const key = isArray ? idx : o.name;
			 const v1 = a[key];
			 const v2 = b[key];
 
			 sts = GSUtil.compare(v1, v2, o.ord, sts);
		 });
 
		 return sts;
	 }
 
	 static compare(v1, v2, order, sts) {
		 const me = this;
		 if (GSUtil.isNumber(v1)) {
			 return sts || GSUtil.compareNum(v1, v2, order);
		 } else if (typeof v1 === 'string') {
			 return sts || GSUtil.compareString(v1, v2, order);
		 }
		 return sts;
	 }
 
	 /**
	  * Compare two string values 
	  * @param {string} v1 
	  * @param {string} v2 
	  * @param {number} ord 
	  * @returns {number} -1, 1, 0
	  */
	 static compareString(v1, v2, ord) {
		 return ord < 0 ? v2.localeCompare(v1) : v1.localeCompare(v2);
	 }
 
	 /**
	  * Compare two numeric values
	  * @param {number} v1 
	  * @param {number} v2 
	  * @param {number} ord positive = ascending, negative - descending 
	  * @returns {number} -1 or 1 or 0
	  */
	 static compareNum(v1, v2, ord) {
		 return ord < 0 ? v2 - v1 : v1 - v2;
	 }
 
	 /**
	  * Get element offset position
	  * @param {HTMLElement} el 
	  * @returns {object} Returns absolute position {left:0, top:0, width:0, height:0,centeY:0 centerX:0}
	  */
	 static getOffset(el) {
		 const rect = el.getBoundingClientRect();
		 const obj = {
			 left: rect.left + window.scrollX,
			 top: rect.top + window.scrollY,
			 width: rect.width,
			 height: rect.height
		 };
		 obj.centerX = obj.left + (obj.width / 2);
		 obj.centerY = obj.top + (obj.height / 2);
		 return obj;
	 }
 
	 /**
	  * Return element position and size without padding
	  * @param {HTMLElement} element 
	  * @returns {object} Parameters as native getBoundingRect
	  */
	 static boundingRect(element, calcPadding) {

		 const rect = element.getBoundingClientRect();
		 const padding = GSUtil.elementPadding(calcPadding ? element : null); 
		 		 
		 const paddingX = padding.x;
		 const paddingY = padding.y;
		 
		 const elementWidth = element.clientWidth - paddingX;
		 const elementHeight = element.clientHeight - paddingY;
		 
		 const elementX = rect.left + padding.left;
		 const elementY = rect.top + padding.top;
 
		 const x = (elementWidth / 2) + elementX;
		 const y = elementY + (elementHeight / 2);
 
		 return {
			 width : elementWidth, 
			 height : elementHeight, 
			 top : elementY, 
			 left : elementX, 
			 x : elementX, 
			 y : elementY, 
			 centerX : x, 
			 centerY : y
		 };
	 }

	 /**
	  * Calculate element padding
	  * @param {HTMLElement} element 
	  * @returns {object}
	  */
	 static elementPadding(element) {

		const obj = {
			left : 0,
			right : 0,
			top : 0,
			bottom : 0,
			x:0,
			y:0
		};

		if (!GSUtil.isHTMLElement(element)) return obj;
		const cs = getComputedStyle(element);
		
		obj.left = parseFloat(cs.paddingLeft);
		obj.right = parseFloat(cs.paddingRight);
		obj.top = parseFloat(cs.paddingTop);
		obj.bottom = parseFloat(cs.paddingBottom);
		obj.x = obj.left + obj.right;
		obj.y = obj.top + obj.bottom;

		return obj;
	 }
 
	 /**
	  * Place element around target element. Bootstrap support for popup etc.
	  * @param {string} placement Location on target element top|bottom|start|end
	  * @param {HTMLElement} source Element to show
	  * @param {HTMLElement} target Element location at which to show
	  * @param {boolean} arrow if true, will calcualte arrow position
	  * @returns {void}
	  */
	 static position(placement = 'top', source, target, arrow) {
 
		 if (!source) return false;
		 if (!target) return false;
 
		 const pos = GSUtil.#fromPlacement(placement);
 
		 if (!GSUtil.#isPlacementValid(pos)) {
			 GSLog.warn(source, `Invalid popover position: ${placement}!`);
			 return;
		 }
 
		 source.style.position = 'fixed';
		 source.style.top = '0px';
		 source.style.left = '0px';
		 source.style.margin = '0px';
		 source.style.padding = '0px';
		 
		 const offh = source.clientHeight / 2;
		 const offw = source.clientWidth / 2;
		 
		 const rect = GSUtil.boundingRect(target, arrow instanceof HTMLElement);
		 const arect = GSUtil.#updateArrow(source, arrow, pos);

		 let x = rect.centerX;
		 let y = rect.centerY;
		 if (pos.isTop) {
			 y = rect.top - source.clientHeight - arect.size;
			 x = x - offw;
		 } else if (pos.isBottom) {
			 y = rect.top + rect.height + arect.size;
			 x = x - offw;
		 } else if (pos.isStart) {
			 x = rect.left - source.clientWidth - arect.size;
			 y =  y - offh + arect.size;
		 } else if (pos.isEnd) {
			 x = rect.left + rect.width + arect.size;
			 y = y - offh + arect.size;
		 }
 
		 source.style.transform = `translate(${x}px, ${y}px)`;
 
	 }
 
	 static #isPlacementValid(obj) {
		  return obj.isStart || obj.isEnd || obj.isTop || obj.isBottom; 
	 }
 
	 static #fromPlacement(placement) {
		 return {
			 isStart : placement == 'start',
			 isEnd : placement == 'end',
			 isTop : placement == 'top',
			 isBottom : placement == 'bottom'			
		 }
	 }
 
	 static #updateArrow(element, arrow, pos) {
 
		 if (!arrow) return {x:0,y:0, size:0, width:0, height:0};
		 let shift = 0;
		 const erect = GSUtil.boundingRect(element);
		 const arect = GSUtil.boundingRect(arrow);
 
		 const size = pos.isStart || pos.isEnd ? arect.width : arect.height;
 
		 const arrowPosW = (erect.width / 2) - (size / 2);
		 const arrowPosH = (erect.height / 2) - (size / 2);
 
		 arect.size = size;
		 arrow.style.position = 'absolute';
 
		 if (pos.isStart || pos.isEnd) {
			 arrow.style.left = null;
			 arrow.style.top = '0px';
			 shift = pos.isStart ? size : -1 * size;
			 arrow.style.transform = `translate(${shift}px, ${arrowPosH / 2}px)`;
		 } else {
			 arrow.style.top = null;
			 arrow.style.left = '0px';
			 shift = pos.isTop ? size : -1 * size;
			 arrow.style.transform = `translate(${arrowPosW}px, ${shift}px)`;
		 }
 
		 return arect;		
	 }
 
	 static {
		 Object.seal(GSUtil);
		 window.GSUtil = GSUtil;
	 }
 }
 
 