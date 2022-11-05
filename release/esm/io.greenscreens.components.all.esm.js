/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSID class
 * @module base/GSID
 */

/**
 * Generic unique ID generator for element
 * @class
 */
class GSID {

	static #id = 0;

	/**
	 * Reset ID counter to 0
	 */
	static reset() {
		this.#id = 0;
	}

	/**
	 * Get next unique generated ID
	 * @param {*} prefx Value to prepend to ID counter
	 * @returns {string} A generated ID
	 */
	static next(prefx = 'GSId-') {
		return `${prefx}${this.#id++}`;
	}

	/**
	 * Auto generate next ID
	 * @returns {string} A generated ID
	 */
	static get id() {
		return this.next();
	}

	/**
	 * Calculate hashcode from string (Java compatible)
	 * @param {*} s A text fro mwhich hashcode is calculated 
	 * @returns {Number} Generated numeric hashcode
	 */
	static hashCode(s) {
		const l = (s || '').length;
		let h = 0, i = 0;
		if (l === 0) return h;
		while (i < l) {
			h = (h << 5) - h + s.charCodeAt(i++) | 0;
		}
		return h;
	};

	static {
		Object.freeze(GSID);
	}

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSBase class
 * @module head/GSBase
 */

/**
 * Base head element to load src based on environment
 * @class
 * @abstract
 */
class GSBase extends HTMLElement {

	static #id = 0

	#refid = '';

	static get observedAttributes() {
		return [];
	}

	/**
	 * Get next unique element ID
	 * @returns {string} A unnique value for element id
	 */
	static nextID() {
		GSBase.#id++;
		return `GSHID_${GSBase.#id}`;
	}

	/**
	 * Calculate string hash code
	 * @param {string} A string to calculate hash from
	 * @returns {number} A value calculated from provided string 
	 */
	static hashCode(s) {
		let h = 0,
			l = s.length,
			i = 0;

		if (l > 0) {

			while (i < l) {
				h = (h << 5) - h + s.charCodeAt(i++) | 0;
			}

		}

		return h;
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
	 * @param {HTMLElement} sender An element that dispatch the event
	 * @param {string} name Event name 
	 * @param {object} obj Event data 
	 */
	static sendSuspendedEvent(sender = document, name, obj = '') {
		requestAnimationFrame(() => {
			GSBase.sendEvent(sender, name, obj);
		});
	}

	/**
	 * Called every time node is added to parent node
	 */
	connectedCallback() {

		const me = this;

		if (me.url && me.isRenderable()) {

			const hash = GSBase.hashCode(me.url);

			const tmp = document.querySelector(`[data-hash="${hash}"]`);
			if (tmp) {
				// console.log(`URL already exists: ${me.url}`);
				me.remove();
				return;
			}

			const el = me.render();
			const isPromise = el instanceof Promise;

			if (el && !isPromise) {

				el.dataset.hash = hash;

				if (me.isHead) {
					document.head.appendChild(el);
				} else {
					//me.parentElement.appendChild(el);
					me.insertAdjacentElement('afterend', el);
				}

				if (me.isAuto) {
					el.id = el.id ? el.id : GSBase.nextID();
					me.#refid = el.id;
				}

			}
		}

		if (!me.isAuto) {
			me.remove();
		}

	}

	/**
	 * Called when node is removed from DOM tree
	 */
	disconnectedCallback() {

		const me = this;
		if (me.isAuto && me.#refid) {
			const el = document.querySelector(`#${me.#refid}`);
			if (el) el.remove();
		}
		me.dispose();

	}

	/**
	 * Called when element attribute changed
	 * 
	 * @param {*} name 
	 * @param {*} oldValue 
	 * @param {*} newValue 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		const me = this;
		requestAnimationFrame(() => {
			me.attributeCallback(name, oldValue, newValue);
		});
	}

	/**
	 * Used on top classes to be called under animation frame to update UI
	 * @param {*} name 
	 * @param {*} oldValue 
	 * @param {*} newValue 
	 */
	attributeCallback(name, oldValue, newValue) {

	}

	/**
	 * Called when element attached to a page and ready to render
	 */
	render() {

	}

	/**
	 * Calle when element removed from a page.
	 */
	dispose() {

	}

	/**
	 * Check if env is mobile
	 * @returns {boolean}
	 */
	get isMobile() {
		if (navigator.userAgentData) return navigator.userAgentData.mobile;
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}

	/**
	 * Check if matching protocol
	 * @returns {boolean}
	 */
	get isProtocol() {
		const schema = this.protocol;
		if (!schema) return true;
		const protocol = location.protocol.replace(':', '');
		if ('http' === schema && protocol === schema) return true;
		if ('https' === schema && protocol === schema) return true;
		return false;
	}

	/**
	 * Check if running in mobile app
	 * @returns {boolean}
	 */
	get isAsset() {
		return this.isTarget('GreenScreens');
	}

	/**
	 * Check browser target by value
	 *
	 * @param {String} matching value
	 * @returns {boolean}
	 */
	isTarget(value = '') {

		if (!value) return true;
		const strVal = value.toLowerCase();
		if (navigator.userAgentData) {
			let sts = false;
			navigator.userAgentData.brands.forEach((v) => {
				if (v.brand.toLowerCase().includes(strVal)) {
					sts = true;
				}
			});
			return sts;
		}

		const regex = new RegExp(`${value}`, 'i');
		const sts = navigator.userAgent.match(regex);
		return sts ? true : false;
	}

	/**
	 * Return state based on matching rules set through element attributes
	 * @returns {boolean}
	 */
	isRenderable() {

		const me = this;

		const isMobile = me.isMobile;
		const isAsset = me.isAsset;
		const isProtocol = me.isProtocol;
		const target = me.target;
		const env = me.env;

		if (!isProtocol) return false;

		if (env === 'assets' && isAsset === false) {
			return false;
		}

		if (env === 'browser' && isAsset === true) {
			return false;
		}

		if (env === 'mobile' && isMobile === false) {
			return false;
		}

		if (env === 'desktop' && isMobile === true) {
			return false;
		}

		if (!me.isTarget(target)) {
			return false;
		}

		return true;
	}

	/**
	 * Retrieve environment under which resource is used
	 * @returns {string} assets|browser|mobile|desktop
	 */
	get env() {
		return this.getAttribute('env') || '';
	}

	/**
	 * Retrieve browser target under which resource is used
	 * @returns {string} chrome|edge|firefox etc...
	 */
	get target() {
		return this.getAttribute('target') || '';
	}

	/**
	 * Retrieve resource url
	 * @returns {string}
	 */
	get url() {

		const me = this;
		let url = me.getAttribute('url') || '';

		if (me.env === 'assets') {
			return '**' + url;
		}


		// prevent caching in dev mode
		if (me.#nocache) {
			try {
				let base = `${location.origin}${location.pathname}`;
				if (url.startsWith('/')) base = location.origin;
				if (url.startsWith('http')) base = undefined;
				const uri = new URL(url, base);
				uri.searchParams.append('_dc', Date.now());
				url = uri.href;
			} catch (e) {
				console.log(e);
			}
		}

		return url;
	}

	/**
	 * Retrieve mime resource type
	 * @returns {string}
	 */
	get type() {
		const me = this;
		let type = me.getAttribute('type') || '';
		if (!type) {
			if (me.url.indexOf('.js') > 0) {
				type = 'text/javascript';
			} else if (me.url.indexOf('.css') > 0) {
				type = 'text/css';
			}
		}		return type;
	}

	/**
	 * Retrieve if resource loading is asynchronous 
	 * @returns {boolean}
	 */
	get async() {
		return this.getAttributeBool('async', 'false');
	}

	/**
	 * Retrieve if resource loading is defered
	 * @returns {boolean}
	 */
	get defer() {
		return this.getAttributeBool('defer', 'false');
	}

	/**
	 * Determine if loaded resource will be rendered inside html head
	 * @returns {boolean}
	 */
	get isHead() {
		return this.getAttributeBool('head');
	}

	/**
	 * If automatic, element is not self removed after resource is loaded.
	 * @returns {boolean}
	 */
	get isAuto() {
		return this.getAttributeBool('auto');
	}

	/**
	 * Retrieve https or https protocol. 
	 * Used to filter under which protocol loader element is applied
	 * @returns {string}
	 */
	get protocol() {
		return this.getAttribute('protocol') || '';
	}

	/**
	 * Resource nonce value for content check
	 * @returns {string}
	 */
	get nonce() {
		return this.getAttribute('nonce') || '';
	}

	get crossorigin() {
		return this.getAttribute('crossorigin');
	}

	get fetchpriority() {
		return this.getAttribute('fetchpriority') || 'auto';
	}

	get integrity() {
		return this.getAttribute('integrity');
	}

	get referrerpolicy() {
		return this.getAttribute('referrerpolicy');
	}

	/**
	 * Check if attribute is true or just available
	 * @param {string} name Attribute name
	 * @returns {boolean}
	 */
	getAttributeBool(name = '', dft = 'true') {
		const val = this.getAttribute(name) || dft;
		return val === 'true';
	}

	get #nocache() {
		// const hasKey = Object.hasOwn(globalThis, 'GS_NO_CACHE');
		const hasKey = 'GS_NO_CACHE' in globalThis;
		if (hasKey) {
			return globalThis.GS_NO_CACHE;
		}
		return localStorage ? localStorage.getItem('GS_NO_CACHE') == 'true' : false;
	}

	static {
		Object.seal(GSBase);
	}

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Cache for dyamically laoded styles.
 * Used to sharestyles among GS-* WebComponents
 * @class
 */
class GSCacheStyles {

	static #store = new Map();

	/**
	 * Store initialized stylesheet under the unique ID
	 * @param {string} id 
	 * @param {CSSStyleSheet} style 
	 * @returns {CSSStyleSheet} Stored stylesheet
	 */
	static set(id, style) {
		const me = this;
		if (style instanceof CSSStyleSheet) {
			me.#store.set(id, style);
		}

		if (typeof style === 'string') {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(style);
			me.#store.set(id, sheet);
		}

		return me.get(id);

	}

	/**
	 * Remove stylesheet by unique ID
	 * @param {string} id 
	 * @returns {boolean}
	 */
	static remove(id) {
		return this.#store.delete(id);
	}

	/**
	 * Retrieve stylesheet by unique ID
	 * @param {string} id 
	 * @returns {boolean}
	 */
	static get(id) {
		return this.#store.get(id);
	}

	/**
	 * Retrieve CSSStyleSheet by ID, and automatically store in cache if does not exist
	 * @param {string} id Unique stylesheed id
	 * @param {CSSStyleSheet} style 
	 * @returns {boolean}
	 */
	static getOrSet(id, style) {
		if (style && style.cssRules.length === 0) return;
		const me = GSCacheStyles;
		const el = me.get(id);
		if (el) return el;
		return me.set(id, style);
	}

	/**
	 * Return lsit of registered style sheets
	 * @returns {Array<CSSStyleSheet>}
	 */
	static get styles() {
		return Array.from(new Map([...GSCacheStyles.#store].sort((a, b) => String(a[0]).localeCompare(b[0]))).values());
	}

	/*
	* Inject CSS used by framework
	*/
	static injectStyle(css = '', hash = 0) {
		if (!css) return;
		try {
			hash = hash || GSBase.hashCode(css);
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(css);
			GSCacheStyles.getOrSet(hash, sheet);
			document.adoptedStyleSheets = GSCacheStyles.styles;
		} catch (e) {
			console.log(e);
		}
	}

	static {
		Object.freeze(GSCacheStyles);
		window.GSCacheStyles = GSCacheStyles;
		const style = '.gs-hide{display:none !important;}.gs-hide-orientation,.gs-render{display:none !important;}gs-item{display:none !important;}';
		GSCacheStyles.injectStyle(style);
	}
}

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
class GSLog {

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

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A generic set of static functions used across GS WebComponents framework
 * @class
 */
class GSUtil {

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

	static fromLiteral = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => obj[g]);

	static capitalize = (word) => word[0].toUpperCase() + word.slice(1).toLowerCase();

	static capitalizeAll = (word, split = ' ') => word.split(split).map((v, i) => GSUtil.capitalize(v)).join(split);

	static capitalizeAttr = (word) => word.split('-').map((v, i) => i ? GSUtil.capitalize(v) : v).join('');

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

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A set of static functions used for processing functions
 * @class
 */
class GSFunction {

    /**
     * Check if object is of type function
     * 
     * @param {function} fn 
     * @returns {boolean}
     */
    static isFunction = (fn) => typeof fn === 'function';

    /**
     * Check if object has function
     * 
     * @param {object} o 
     * @param {function} fn 
     * @returns {boolean}
     */
    static hasFunction(o, fn) {
        return o && GSFunction.isFunction(o[fn]);
    }

    /**
     * Check if object is of type async function
     * 
     * @param {function} fn 
     * @returns  {boolean}
     */
    static isFunctionAsync(fn) {
        if (!GSFunction.isFunction(fn)) return false;
        const AsyncFunction = GSFunction.callFunctionAsync.constructor;
        let isValid = fn instanceof AsyncFunction;
        if (!isValid) isValid = fn[Symbol.toStringTag] == "AsyncFunction";
        return isValid;
    }

    /**
     * Generic asynchronous function caller
     * 
     * @async
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
        if (!GSFunction.isFunction(fn)) return;
        if (GSFunction.isFunctionAsync(fn)) {
            return GSFunction.callFunctionAsync(fn, owner);
        }
        return GSFunction.callFunctionSync(fn, owner);
    }

    /**
     * Convert string pointer to function call
     * 
     * @param {string} value 
     * @returns  {function}
     */
    static parseFunction(value) {
        const fn = GSUtil.parseValue(value);
        return GSFunction.isFunction(fn) ? fn : null;
    }

    static {
        Object.seal(GSFunction);
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSAttr class
 * @module base/GSDOM
 */

/**
 * A generic set of static functions to handle DOM Attributes
 * @class
 */
class GSAttr {

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
		globalThis.GSAttr = GSAttr;
	}
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A generic set of static functions to handle DOM tree and DOM elements
 * @class
 */
class GSDOM$1 {

	// Timeout for removing element
	static SPEED = 300;

	/**
	* Parse string into html DOM
	*
	* @param {string} html Source to parse
	* @param {boolean} single Return first element or all
	* @param {string} mime Src mime type
	* @return {HTMLElement}
	*/
	static parse(html = '', single = false, mime = 'text/html') {
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, mime);
			return single ? doc?.body?.firstElementChild : doc;
		} catch (e) {
			GSLog.error(null, e);
			throw e;
		}
	}

	/**
	 * Parse source and auto wrap if required
	 * @param {GSElement} own 
	 * @param {string} src 
	 * @returns {HTMLElement}
	 */
	static parseWrapped(own, src = '', forceWrap = false) {

		const doc = GSDOM$1.parse(src);
		const nodes = GSDOM$1.#fromNode(doc.head.children).concat(GSDOM$1.#fromNode(doc.body.children));
		const wrap = forceWrap || nodes.length !== 1;

		const tpl = GSDOM$1.wrap(own, wrap ? null : nodes.shift());

		while (nodes.length > 0) tpl.appendChild(nodes.shift());

		return tpl;
	}

	/**
	 * The same as lin function, with default wrapper element
	 * 
	 * @param {HTMLElement} own Owner element to which target is linked
	 * @param {HTMLElement} target Target elemetn to link to owner
	 * @returns {HTMLElement} Return target
	 */
	static wrap(own, target) {
		return GSDOM$1.link(own, target || document.createElement('gs-block'));
	}

	/**
	 * Create reference between two HTMLElements
	 * 
	 * @param {HTMLElement} own Owner element to which target is linked
	 * @param {HTMLElement} target Target elemetn to link to owner
	 * @returns {HTMLElement} Return target
	 */
	static link(own, target) {
		target.setAttribute('proxy', `#${own.id}`);
		if (own.slot) target.setAttribute('slot', own.slot);
		return target;
	}

	static #fromNode(nodes) {
		return Array.from(nodes || []).filter(el => !GSDOM$1.isText(el));
	}

	/**
	 * Check if given value is part of HTMLFormElement
	 * @param {string | HTMLElement} el 
	 * @returns {boolean}
	 */
	static isFormElement(el) {
		const name = GSUtil.isString(el) ? el : el?.tagName;
		return ['INPUT','SELECT','TEXTAREA', 'BUTTON'].indexOf(name) > -1;
	}
	/**
	  * Check if given element is of given type 
	  * 
	  * @param {HTMLElement} el
	  * @param {string|class} type Tag Name, class name or Class
	  * @returns {boolean}
	  */
	static isElement(el, type) {

		const isArgs = type && el;
		if (!isArgs) return false;

		const isStr = GSUtil.isString(type);

		if (!isStr) return el instanceof type;

		const ownClazz = customElements.get(type.toLowerCase());
		if (ownClazz && el instanceof ownClazz) return el;

		const it = GSDOM$1.inheritance(el);
		for (let pel of it) {
			if (pel?.constructor?.name === type) return el;
		}

		if (type.toUpperCase() === el.tagName) return el;

		return false;
	}

	/**
	 * Check if given element is of type HTMLElement
	 * @returns {boolean}
	 */
	static isTemplateElement(el) {
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

	/**
	 * Check if given element is of type Text
	 * @returns {boolean}
	 */
	static isText(el) {
		return el instanceof Text;
	}

	/**
	 * Check if given element is of type Comment
	 * @returns {boolean}
	 */
	static isComment(el) {
		return el instanceof Comment;
	}

	/*
	 * Check if given element is of type GSElement
	 */
	static isGSElement(el) {
		if (!el?.clazzName) return false;
		//if (el?.tagName?.indexOf('GS-') === 0) return true;
		const it = GSDOM$1.inheritance(el);
		for (let v of it) {
			if (!v) break;
			if (v?.clazzName === 'GSElement') return true;
		}
		return false;
	}

	/**
	 * Check if standard element extended with GS
	 * @param {HTMLElement} el 
	 * @returns {boolean}
	 */
	static isGSExtra(el) {
		return el?.getAttribute('is')?.indexOf('GS-') === 0;
	}

	/**
	 * Get all child GSElement	
	 * @param {HTMLElement} el 
	 * @returns {Array<HTMLElement>}
	 */
	static getChilds(el) {
		return Array.from(el?.childNodes || []).filter(e => GSDOM$1.isGSElement(e));
	}

	/**
	 * Hide html element
	 * @param {HTMLElement} el 
	 * @param {boolean} orientation 
	 * @returns {boolean}
	 */
	static hide(el, orientation = false) {
		return el?.classList?.add(orientation ? 'gs-hide-orientation' : 'gs-hide');
	}

	/**
	 * Show html element
	 * @param {HTMLElement} el 
	 * @param {boolean} orientation 
	 * @returns {boolean}
	 */
	static show(el, orientation = false) {
		return el?.classList?.remove(orientation ? 'gs-hide-orientation' : 'gs-hide');
	}

	/**
	 * Add node as next in list of nodes
	 * @param {HTMLElement} target 
	 * @param {HTMLElement} newEl 
	 * @returns {boolean}
	 */
	static addSibling(target, newEl) {
		const injectable = GSDOM$1.isHTMLElement(newEl) || GSDOM$1.isSVGElement(newEl);
		const isOK = GSDOM$1.isHTMLElement(target) && injectable;
		const invalid = target === newEl && target.parentNode === newEl || target.nextElementSibling === newEl;
		return isOK && !invalid ? target.parentNode.insertBefore(newEl, target.nextElementSibling) : false;
	}

	/**
	 * Add child node to a target
	 * @param {HTMLElement} target 
	 * @param {HTMLElement} newEl 
	 * @returns {boolean}
	 */
	static appendChild(target, newEl) {
		const isok = GSDOM$1.isHTMLElement(target) && GSDOM$1.isHTMLElement(newEl);
		return isok && target !== newEl ? target.appendChild(newEl) : false;
	}

	/**
	 * Add node to a target at specified place
	 * @param {HTMLElement} target 
	 * @param {HTMLElement} newEl 
	 * @param {string} placement
	 * @returns {boolean}
	 */
	static insertAdjacent(target, newEl, placement) {
		const isok = GSDOM$1.isHTMLElement(target) && GSDOM$1.isHTMLElement(newEl);
		const invalid = target === newEl && target.parentNode === newEl;
		return isok && !invalid ? target.insertAdjacentElement(placement, newEl) : false;
	}

	/**
	 * Remove genarated componnt from parent
	 * @param {HTMLElement} el 
	 * @returns {boolean}
	 */
	static removeElement(el) {
		return el?.parentNode?.removeChild(el);
	}

	/**
	 * Walk node tree
	 * 
	 * @param {HTMLLegendElement} node Start node to walk from 
	 * @param {boolean} closest Direction down (false) or up (true)
	 * @param {boolean} all  Filter HTMLElements (false) only or text also (true) (only down)
	 * @param {boolean} shadow Traverse shadow DOM also (only down)
	 * @returns {Iterable}
	 */
	static walk(node, closest = false, all = false, shadow = true) {
		return closest ? GSDOM$1.parentAll(node) : GSDOM$1.childAll(node, all, shadow);
	}

	/**
	 * Traverse DOM tree top-to-bottom
	 * 
	 * @param {*} node Start node
	 * @param {*} all  Include all elements (Text,Comment, HTMLElements)
	 * @param {*} shadow Include traversing aacross shadow tree
	 * @param {*} child Inernal, do not use
	 * @returns {Iterable}
	 */
	static *childAll(node, all = false, shadow = true, child = false) {
		if (!node) return;
		if (child) yield node;
		if (shadow) yield* GSDOM$1.childAll(node.shadowRoot, all, shadow, true);
		const list = all ? node.childNodes : node.children;
		if (!list) return;
		for (let child of list) {
			yield* GSDOM$1.childAll(child, all, shadow, true);
		}
	}

	/**
	 * Get parent element
	 * 
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
		let e = GSDOM$1.parent(el);
		while (e) {
			yield e;
			e = GSDOM$1.parent(e);
		}
		if (e) return yield e;
	}

	/**
	 * Element prototype iterator
	 * @param {HTMLElement} el 
	 * @returns {HTMLElement}
	 * @iterator
	 */
	static *inheritance(el) {
		let e = el.__proto__;
		while (e) {
			yield e;
			e = e.__proto__;
		}
		if (e) return yield e;
	}

	/**
	 * Get root element whch might be shadow root, GSElement, any parent element
	 * @param {HTMLElement} el 
	 * @returns {HTMLElement|ShadowRoot}
	 */
	static getRoot(el) {
		if (!el) return null;

		const it = GSDOM$1.parentAll(el);
		for (let v of it) {
			if (v instanceof ShadowRoot) return v;
			if (v instanceof HTMLBodyElement) return v;
		}

		return null;
	}

	/**
	 * Find element by ID within DOM Tree across Shadow DOM
	 * @param {HTMLElement} el Root node to start from
	 * @param {string} id Element id
	 * @returns {HTMLElement} 
	 */
	static getByID(el, id) {
		if (typeof el === 'string') return GSDOM$1.getByID(document.body, id);
		if (!(el && id)) return null;
		const it = GSDOM$1.walk(el, false);
		for (let o of it) {
			if (o.id === id) return o;
		}
		return null;
	}

	/**
	 * Query DOM Tree up to find closest element across Shadow DOM
	 * @param {HTMLElement} el Root node to start from
	 * @param {string} qry CSS query
	 * @returns {HTMLElement} 
	 */
	static closest(el, qry) {
		if (typeof el === 'string') return GSDOM$1.closest(document.body, qry);
		if (!(el && qry)) return null;
		const it = GSDOM$1.walk(el, true);
		for (let o of it) {
			if (GSDOM$1.matches(o, qry)) return o;
		}
		return null;
	}

	/**
	 * Query DOM tree with support for Shadow DOM
	 * 
	 * @param {HTMLElement} el Root node to start from
	 * @param {string} qry CSS query
	 * @returns {HTMLElement} 
	 */
	static query(el, qry, all = false, shadow = true) {
		if (typeof el === 'string') return GSDOM$1.query(document.body, el, all, shadow);
		if (!(el && qry)) return null;
		if (GSDOM$1.matches(el, qry)) return el;
		const it = GSDOM$1.walk(el, false, all, shadow);
		for (let o of it) {
			if (GSDOM$1.matches(o, qry)) return o;
		}
		return null;
	}

	/**
	 * Match element against CSS query
	 * @param {HTMLElement} el 
	 * @param {string} qry 
	 * @returns {boolean}
	 */
	static matches(el, qry) {
		// return el && qry && typeof el.matches === 'function' && el.matches(qry);
		return el && typeof el.matches === 'function' && el.matches(qry);
	}

	/**
	 * Query DOM tree with support for Shadow DOM
	 * 
	 * @param {HTMLElement} el Root node to start from
	 * @param {string} qry CSS query
	 * @returns {Array<HTMLElement>}
	 */
	static queryAll(el, qry, all = false, shadow = true) {
		if (typeof el === 'string') return GSDOM$1.queryAll(document.body, el, all, shadow);
		const res = [];
		if (!(el && qry)) return res;
		const it = GSDOM$1.walk(el, false, all, shadow);
		for (let o of it) {
			if (GSDOM$1.matches(o, qry)) res.push(o);
		}
		return res;
	}

	/**
	 * Set html text to provided element.
	 * NOTE: Done intentionaly like this to prevent source validation warning.
	 * @param {HTMLElement} el 
	 * @param {string} val 
	 * @returns {void}
	 */
	static setHTML(el, val = '') {
		// TODO - use sanitizer when not any more experimental feature; watch for default Sanitizer.getDefaultConfiguration()
		//if (el?.setHTML) return el.setHTML(val);
		const isValid = el instanceof ShadowRoot || el instanceof HTMLElement || el instanceof HTMLTemplateElement;
		if (isValid) el.innerHTML = val;
	}

	/**
	 * Set text to provided element
	 * @param {HTMLElement} el 
	 * @param {string} val 
	 * @returns {void}
	 */
	static setText(el, val = '') {
		if (el) el.textContent = val;
	}

	/**
	 * Safe way to toggle CSS class on element, multipel classes are supported in space separated string list
	 * @param {HTMLElement} el 
	 * @param {*} val list of css classes in space separated string
	 * @param {boolean} sts True to add, false to remove
	 * @returns {boolean}
	 */
	static toggleClass(el, val, sts = true) {
		if (!GSDOM$1.isHTMLElement(el)) return false;
		if (!val || val.trim().length == 0) return false;
		val = val.split(' ').filter(v => v && v.trim().length > 0);
		if (sts === null) return val.forEach(v => el.classList.toggle(v));
		sts ? el.classList.add.apply(el.classList, val) : el.classList.remove.apply(el.classList, val);
		return true;
	}

	/**
	 * Toggle element visibility
	 * @param {HTMLElement} el 
	 * @param {boolean} sts 
	 */
	static toggle(el, sts = true) {
		return GSDOM$1.toggleClass(el, 'd-none', sts);
	}

	/**
	 * Checks if element contains a css class
	 * @param {HTMLElement} el 
	 * @param {string} val 
	 * @returns {boolean}
	 */
	static hasClass(el, val = '') {
		return el?.classList?.contains(val);
	}

	/**
	 * Alternative way to clear fields instead of form.reset()
	 * @param {HTMLElement} owner 
	 * @param {string} qry 
	 */
	static clearInputs(owner, qry = 'input, textarea') {
		const root = GSDOM$1.unwrap(owner);
		requestAnimationFrame(() => {
			root.querySelectorAll(qry).forEach((el) => el.value = '');
		});
	}

	/**
	 * Get value from form element
	 * @param {HTMLElement} el 
	 * @returns {string}
	 */
	static toValue(el) {
		if (!GSDOM$1.isHTMLElement(el)) return undefined;
		if ('checkbox' === el.type) return el.checked;
		let value = el.value;
		if ('text' === el.type) {
			const map = GSDOM$1.styleValue(el, 'text-transform');
			if (map) {
				if ('lowercase' == map.value) value = el.value.toLowerCase();
				if ('uppercase' == map.value) value = el.value.toUpperCase();
			}
		}
		return value;
	}

	/**
	 * Set element value, taking chekbox into consideration
	 * @param {HTMLElement} el 
	 * @param {string|boolean|number} val 
	 * @returns 
	 */
	static fromValue(el, val) {
		if (!GSDOM$1.isHTMLElement(el)) return;
		if (el.type === 'checkbox') {
			el.checked = val == true;
		} else {
			el.value = val;
		}
	}

	/**
	 * Support for Firefox/Gecko to get element computedStyledMap item
	 * @param {HTMLElement} el 
	 * @returns {}
	 */
	static styleValue(el, name) {
		const map = GSDOM$1.getComputedStyledMap(el);
		if (typeof map.get === 'function') return map.get(name);
		return map[name];
	}

	/**
	 * Support for Firefox/Gecko to get element computedStyledMap
	 * @param {HTMLElement} el 
	 * @returns {}
	 */
	static getComputedStyledMap(el) {
		if (el.computedStyleMap) return el.computedStyleMap();
		if (window.getComputedStyle) return window.getComputedStyle(el);
		return null;
	}

	/**
	 * Convert form elements into JSON object
	 * @param {HTMLElement} owner 
	 * @param {string} qry 
	 * @param {boolean} invalid Should include invalid fields
	 * @returns {object}
	 */
	static toObject(owner, qry = 'input, textarea, select', invalid = true) {
		const root = GSDOM$1.unwrap(owner);
		const params = {};
		const list = GSDOM$1.queryAll(root, qry); // root.querySelectorAll(qry);
		Array.from(list)
			.filter(el => el.name)
			.filter(el => el.dataset.ignore !== 'true')
			.filter(el => invalid ? true : el.checkValidity())
			.forEach(el => {
				params[el.name] = GSDOM$1.toValue(el);
			});
		return params;
	}

	/**
	 * Convert JSON Object into HTMLElements (input)
	 * @param {*} owner 
	 * @param {*} qry 
	 * @param {*} obj 
	 * @returns 
	 */
	static fromObject(owner, obj, qry = 'input, textarea, select') {
		if (!obj) return;
		const root = GSDOM$1.unwrap(owner);
		const list = GSDOM$1.queryAll(root, qry); // root.querySelectorAll(qry);
		Array.from(list)
			//.filter(el => el.name && Object.hasOwn(obj, el.name))
			.filter(el => el.name && el.name in obj)
			.forEach(el => GSDOM$1.fromValue(el, obj[el.name]));
	}

	/**
	 * Convert URL hash key/value to form elements
	 * @param {HTMLElement} owner 
	 */
	static fromURLHashToForm(owner) {
		location.hash.slice(1).split('&').every((v) => {
			if (v.length < 2) return true;
			const d = v.split('=');
			GSDOM$1.setValue(`input[name=${d[0]}]`, d[1], owner);
			return true;
		});
	}

	/**
	 * Return element shadowRoot or self
	 * @param {HTMLElement} owner 
	 * @returns {HTMLElement|shadowRoot}
	 */
	static unwrap(owner) {
		return owner ? owner.self || owner : document;
	}

	/**
	 * Enable input on all input elements under provided owner
	 * @param {HTMLElement} own 
	 * @param {string} qry Default to form
	 */
	static enableInput(own, qry = 'input, select, .btn') {
		GSDOM$1.queryAll(own, qry).forEach(el => el.removeAttribute('disabled'));
	}

	/**
	 * Disable input on all input elements under provided owner
	 * @param {HTMLElement} own 
	 * @param {string} qry Default to form
	 */
	static disableInput(own, qry = 'input, select, .btn') {
		GSDOM$1.queryAll(el, qry).forEach(el => el.setAttribute('disabled', true));
	}

	/**
	 * Set value to a element by css selector
	 * @param {string} qry 
	 * @param {string} val 
	 * @param {HTMLElement} own 
	 */
	static setValue(qry, val, own) {
		const el = GSDOM$1.query(own, qry);
		GSDOM$1.fromValue(el, val);
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
		const ts = GSDOM$1.textNodesUnder(root || document).filter(t => t.wholeText.trim().length === 0);
		ts.filter(el => el.nextSibling instanceof Text).forEach(el => el.remove());
		ts.forEach(t => t.nodeValue = t.wholeText.replaceAll(/\u0020{4}/g, '\t').replaceAll(/(\n*\t*)*(?=\n\t*)/g, ''));
	}

	/**
	 * Validate against provided list, if child elements allowed inside provided element
	 * @param {HTMLElement} el Element which slild list to validate
	 * @param {string} tagName Expected owner element tag name
	 * @param {string} whiteList Uppercase list of tag names allowed as child
	 * @param {boolean} asState return state as bool or throw an error (default)
	 * @returns {boolean} return true if validation is ok.
	 * @throws {Error}
	 */
	static validate(own, tagName, whiteList, asState = false) {
		if (own.tagName !== tagName) {
			if (asState) return false;
			throw new Error(`Owner element : ${own.tagName}, id:${own.id} is not of excpected type: ${tagName}`);
		}
		//const ok = Array.from(own.childNodes).filter(el => GSDOM.isAllowed(el, whiteList)).length === 0;
		const ok = GSDOM$1.isAllowed(Array.from(own.childNodes), whiteList);
		if (ok) return true;
		if (asState) return false;
		const msg = GSDOM$1.toValidationError(own, whiteList);
		throw new Error(msg);
	}

	/**
	 * Check against provided list, if child elements allowed inside provided element
	 * @param {HTMLElement|Array<HTMLElement>} el Element which childs to validate against provided list
	 * @param {string} whiteList Uppercase list of tag names allowed as child nodes
	 * @returns {boolean} return tr ue if validation is ok.
	 */
	static isAllowed(el, whiteList) {
		if (Array.isArray(el)) return el.filter(el => GSDOM$1.isAllowed(el, whiteList)).length === 0;
		return !(el instanceof Text || el instanceof Comment) && (!whiteList.includes(el.tagName));
	}

	static toValidationError(own, whiteList) {
		const list = `<${whiteList.join('>, <')}>`;
		return `${own.tagName} ID: ${own.id} allows as a child nodes only : ${list}!`;
	}

	/**
	 * Inject css directly into a shadowRoot of an element
	 * 
	 * @async
	 * @param {HTMLElement} own 
	 * @param {string} url 
	 * @returns {Promise<boolean>}
	 */
	static async injectCSS(own, url) {
		if (!own?.shadowRoot instanceof ShadowRoot) return false;
		let sts = true;
		try {
			const res = await fetch(url);
			if (!res.ok) return;
			const css = await res.text();
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(css);
			own.shadowRoot.adoptedStyleSheets = [sheet];
		} catch (e) {
			console.log(e);
			sts = false;
		}
		return sts;
	}

	static {
		Object.seal(GSDOM$1);
		globalThis.GSDOM = GSDOM$1;
	}
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */


/**
 * Class for handling events, also a registry of all GS-* element listeners
 * @Class
 */
class GSEvent {

	static #cache = new Map();

	static #loaded = false;

	/**
	 * Disable browser console and default context menu
	 */
	static protect() {
		globalThis.addEventListener('contextmenu', (e) => {
			GSEvent.prevent(e);
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
	 * 
	 * @async
	 * @param {HTMLElement} target 
	 * @param {string} name 
	 * @param {function} callback 
	 * @param {Promise<number>} timeout 
	 */
	static async waitPageLoad(target, name = 'loaded', callback, timeout = 100) {
		if (!GSEvent.#loaded) await GSEvent.wait(window, 'load'); // DOMContentLoaded
		GSEvent.#loaded = true;
		await GSUtil.timeout(timeout);
		GSFunction.callFunction(callback);
		GSEvent.sendSuspended(target, name);
	}

	/**
	 * Async version of animation frame
	 * 
	 * @async
	 * @param {function} callback 
	 * @returns {Promise}
	 */
	static async waitAnimationFrame(callback) {
		return new Promise((r, e) => {
			requestAnimationFrame(() => {
				try {
					r();
					if (typeof callback === 'function') callback();
				} catch (er) {
					console.log(er);
					e(er);
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
		return GSDOM$1.queryAll(own, qry).map(el => el.addEventListener(event, callback, opt));
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
		return GSDOM$1.queryAll(own, qry).map(el => el.removeEventListener(event, callback));
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
		return GSEvent.listen(own, qry, event, callback, { once: true });
	}

	/**
	 * Async version of event listener
	 * 
	 * @async
	 * @param {*} own 
	 * @param {*} name 
	 * @returns {Promise}
	 */
	static wait(own, name = '') {
		return new Promise((r, e) => {
			if (!name) return e('Event undefined!');
			GSEvent.once(own, null, name, (e) => r(e.detail));
		});
	}

	/**
	 * Generic prevent event bubling
	 * 
	 * @param {Event} e 
	 */
	static prevent(e) {
		if (GSFunction.hasFunction(e, 'preventDefault')) e.preventDefault();
		if (GSFunction.hasFunction(e, 'stopPropagation')) e.stopPropagation();
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
	static send(sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		const event = new CustomEvent(name, { detail: obj, bubbles: bubbles, composed: composed, cancelable: cancelable });
		return sender?.dispatchEvent(event);
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
		requestAnimationFrame(() => {
			GSEvent.send(sender, name, obj, bubbles, composed, cancelable);
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
	 * @returns {void} 
	 */
	static sendDelayed(timeout = 1, sender = document, name, obj = '', bubbles = false, composed = false, cancelable = false) {
		setTimeout(() => GSEvent.send(sender, name, obj, bubbles, composed, cancelable), timeout);
	}

	/**
	* Generic event listener appender
	 * @param {HTMLElement} own Event owner
	 * @param {HTMLElement} el Owner elelemt to monitor
	 * @param {string} name Event name to moinitor
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
	 * @param {HTMLElement} el Owner elelemt to monitor
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
			elid = GSID.next();
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

	static {
		Object.freeze(GSEvent);
		globalThis.GSEvent = GSEvent;
	}
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSComponent class
 * @module base/GSComponents
 */

/**
 * Registry cache of all instantiated GS-* elements
 * @class
 */
class GSComponents$1 {

    /**
     * Store GS-* elements
     */
    static #cache = new Set();

    /**
     * Store component in component registry cache
     * @param {GSElement} el - GSElement instance to store in component registry cache
     * @returns {void}
     */
    static store(el) {
        GSComponents$1.#cache.add(el);
    }

    /**
     * Remove component from component registry cache by id or GSElement instance
     * @param {GSElement|string} el 
     * @returns {void}
     */
    static remove(el) {
        GSComponents$1.#cache.delete(el);
    }

    /**
     * Get component from component cache by component id
     * @param {string} id 
     * @returns {GSElement}
     */
    static get(id = '') {
        if (!id) return null;
        const els = Array.from(this.#cache).filter(el => el.id === id);
        return els.length === 0 ? null : els[0];
    }

    static #waitForInternal(name = '', timeout = 0, r) {
        const fn = (e) => {
            const el = e.detail;
            const isComp = name.startsWith('gs-') && el.tagName === name.toUpperCase();
            if (isComp || el.id === name) {
                GSEvent.unlisten(document.body, null, 'componentready', fn);
                return r(el);
            }
        };
        const opt = { once: false, capture: false };
        if (timeout > 0) opt.signal = AbortSignal.timeout(timeout);
        GSEvent.listen(document.body, null, 'componentready', fn, opt);
    }

    /**
     * Wait for GSElement to become registered (initialized)
     * @param {string} name A name of GSComponent type (gs-ext-form, etc...)
     * @returns {GSElement}
     */
    static waitFor(name = '', timeout = 0) {
        return new Promise((r, e) => {
            let el = GSComponents$1.find(name) || GSComponents$1.get(name);
            return el ? r(el) : GSComponents$1.#waitForInternal(name, timeout, r);
        });
    }

    /**
     * Notify when GSElement is registered, 
     * @param {*} name Element id or GS-* tagName
     * @param {*} fn Callback function
     */
    static notifyFor(name = '', fn) {
        if (!GSFunction.isFunction(fn)) return false;
        const callback = (e) => {
            const el = e.composedPath().shift();
            const ok = el.id === name || el.tagName === name;
            return ok ? fn(el, e) : undefined;
        };
        const el = GSComponents$1.find(name) || GSComponents$1.get(name);
        if (el) return fn(el);
        GSEvent.listen(document.body, null, 'componentready', callback);
        return callback;
    }

    /**
     * Get all components of a specific type
     * @param {string} name - component name GS-*
     * @param {boolean} flat - return only flat components
     * @param {boolean} shadow  - return only shadowed components
     * @returns {Array<GSElement>}
     */
    static findAll(name = '', flat = true, shadow = true) {

        let result = Array.from(GSComponents$1.#cache);
        if (name) result = result.filter(el => el && GSDOM$1.matches(el, name));
        if (!flat) result = result.filter(el => el.shadowRoot);
        if (!shadow) result = result.filter(el => !el.shadowRoot);

        return result;
    }

    /**
     * Find first GS component
     * @param {string} name - component name GS-*
     * @param {boolean} flat - only flat components
     * @param {boolean} shadow  - only shadowed components
     * @returns {GSElement}
     */
    static find(name = '', flat = true, shadow = true) {
        return GSComponents$1.findAll(name, flat, shadow).shift();
    }

    /**
    * Returns owner of this shadowRoot element
    * @param {HTMLElement} el An instance of HTMLElement
    * @param {string} type A tag name of searched element
    * @returns {HTMLElement} A parent of provided element
    */
    static getOwner(el, type) {
        const isEl = GSDOM$1.isGSElement(el) || GSDOM$1.isHTMLElement(el);
        if (!isEl) return null;

        const it = GSDOM$1.parentAll(el);
        for (let v of it) {
            if (!v) break;
            if (v instanceof ShadowRoot) {
                const parent = GSDOM$1.parent(v);
                if (!type) return parent;
                if (GSDOM$1.isElement(parent, type)) return parent;
                return GSComponents$1.getOwner(parent, type);
            }
            if (GSDOM$1.isElement(v, type)) return v;
        }

        return type ? null : document.body; //  GSDOM.parent(el);
    }

    /**
     * Check if class instance has defined property getter 
     * @param {object} own Class instance
     * @param {string} name Getter name to check
     * @returns {boolean} Returns true if getter exist
     */
    static hasGetter(own, name) {
        return GSComponents$1.hasFunc(own, name, 'get');
    }

    /**
     * Check if class instance has defined property setter 
     * @param {object} own Class instance
     * @param {string} name Getter name to check
     * @returns {boolean} Returns true if setter exist
     */
    static hasSetter(own, name) {
        return GSComponents$1.hasFunc(own, name, 'set');
    }

    /**
     * Check if class instance has defined function
     * @param {object} own Class instance
     * @param {string} name Function name to check
     * @param {string} fn Function name to check
     * @returns {boolean} Returns true if getter exist
     */
    static hasFunc(own, name, fn) {
        const desc = Reflect.getOwnPropertyDescriptor(own.__proto__, name);
        return desc && typeof desc[fn] === 'function';
    }

    /**
     * Listen for global WebComponent css style changes to reapply to active componentes
     * @returns {void}
     */
    static listenStyles() {
        if (GSComponents$1.#listener) return;
        document.addEventListener('gs-style', GSComponents$1.#onStyles);
        GSComponents$1.#listener = true;
    }

    /**
     * Remove global WebComponent css style changes listner 
     * @returns {void}
     */
    static unlistenStyles() {
        document.removeEventListener('gs-style', GSComponents$1.#onStyles);
        GSComponents$1.#listener = false;
    }

    static #listener = false;
    static #onStyles() {
        requestAnimationFrame(() => {
            GSComponents$1.findAll(null, false, true).filter(el => el.shadowRoot).forEach(el => el.shadowRoot.adoptedStyleSheets = GSCacheStyles.styles);
        });
    }

    static {
        Object.freeze(GSComponents$1);
        GSComponents$1.listenStyles();
        globalThis.GSComponents = GSComponents$1;
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A set of static functions used for loading resources
 * @class
 */
class GSLoader {

    static TEMPLATE_URL = globalThis.GS_TEMPLATE_URL || location.origin;
    static NO_CACHE = false;

    static {
        if (!globalThis.GS_TEMPLATE_URL) {
            const url = location.href.split('?').pop();
            let seg = url.split('/');
            GSLoader.TEMPLATE_URL = url.endsWith('/') ? url : seg.slice(0, -1).join('/');
            globalThis.GS_TEMPLATE_URL = GSLoader.TEMPLATE_URL;
        }

        //const hasKey = Object.hasOwn(self, 'GS_NO_CACHE');
        const hasKey = 'GS_NO_CACHE' in self;
        if (hasKey) {
            GSLoader.NO_CACHE = globalThis.GS_NO_CACHE === true;
            if (localStorage) localStorage.setItem('GS_NO_CACHE', GSLoader.NO_CACHE);
        }
        GSLoader.NO_CACHE = localStorage ? localStorage.getItem('GS_NO_CACHE') == 'true' : false;

    }
    /**
     * Convert partial URL to a real URL
     * @param {string} url 
     * @return {string}
     */
    static normalizeURL(url = '', base = false) {

        url = url || '';
        let path = null;
        const isFile = location.pathname.split('/').pop(-1).includes('\.');
        const isExt = url.includes('extension://');
        const isUrl = url.startsWith('http');

        if (isUrl || isExt) {
            path = url;
        } else if (url.startsWith('/')) {
            path = `${location.origin}/${url}`;
        } else if (isFile) {
            path = `${location.origin}${location.pathname}/../${url}`;
        } else {
            path = `${location.origin}${location.pathname}/${url}`;
        }

        path = path.split('://').map(v => v.replaceAll(/\/{2,}/g, '/')).join('://');
        const uri = new URL(path);

        // to handle caching
        if (!base && GSLoader.NO_CACHE) uri.searchParams.append('_dc', Date.now());

        return uri.href;
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
     * 
     * @async
     * @param {string} def
     * @return {Promise<string>}
     */
    static async getTemplate(def = '') {

        if (!def) return def;

        const isRef = def.startsWith('#');
        if (isRef) {
            const el = GSDOM$1.query(document.documentElement, def);
            return el ? el.innerHTML : def;
        }

        const isHTML = GSUtil.isHTML(def);
        if (isHTML) return def;

        def = GSLoader.#getTemplateURL(def);
        return GSLoader.loadSafe(def);
    }

    /**
     * Decode template URL into a real URL
     * @param {string} url 
     * @return {string}
     */
    static #getTemplateURL(url = '') {
        /*
        const isDirect =  /^(https?:\/\/)/i.test(url);
        url = isDirect ? url : GSLoader.#templateURL + '/' + url;
        */
        url = url.startsWith('//') ? GSLoader.#templateURL + '/' + url : url;
        return GSLoader.normalizeURL(url);
    }

    /**
     * Retrieve default template url
     * @return {string}
     */
    static get #templateURL() {
        return GSLoader.normalizeURL(GSLoader.#templatePath, true);
    }

    /**
     * Retrieve defult template path
     * @return {string}
     */
    static get #templatePath() {
        return GSLoader.TEMPLATE_URL ? GSLoader.TEMPLATE_URL.replace('//', '/') : '';
    }

    /**
     * Load html template (used for template cache)
     * 
     * @async
     * @param {string} val Full or partial url path
     * @param {string} method HTTP methog get|put|post
     * @returns {Promise<string>}
     * @throws {Error}
     */
    static async loadTemplate(val = '', method = 'GET') {
        const url = GSLoader.#getTemplateURL(val);
        return await GSLoader.load(url, method);
    }

    /**
     * Load remote data as text (for loading templates)
     * 
     * @async
     * @param {string} val Full or partial url path
     * @param {string} method HTTP methog get|put|post
     * @param {boolean} asjson Parse returned data as JSON
     * @returns {Promise<object|string>}
     */
    static async load(val = '', method = 'GET', headers, asjson = false) {
        let data = null;
        const ct = 'Content-Type';
        headers = headers || {};
        headers[ct] = asjson ? 'application/json' : headers[ct] || 'text/plain';
        const url = GSLoader.normalizeURL(val, true);
        const res = await fetch(url, { method: method, headers: headers });
        if (res.ok) data = asjson ? await res.json() : await res.text();
        return data;
    }

    /**
     * Load remote data without throwing an exception
     * 
     * @async
     * @param {string} url Full or partial url path
     * @param {string} method http method GET|POST|PUT
     * @param {object} headers return json or string
     * @param {boolean} asjson return json or string
     * @param {object} dft default value
     * @returns {Promise<object|string>}
     */
    static async loadSafe(url = '', method = 'GET', headers, asjson = false, dft) {
        try {
            if (url) return GSLoader.load(url, method, headers, asjson);
        } catch (e) {
            GSLog.error(this, e);
        }
        if (dft) return dft;
        return asjson ? {} : '';
    }


    /**
     * Load data from various sources
     * 
     * @async
     * @param {JSON|func|url} val 
     * @returns {Promise}
     */
    static async loadData(val = '') {

        const isJson = GSUtil.isJson(val);
        const func = !isJson && GSFunction.parseFunction(val);
        const isFunc = GSFunction.isFunction(func);
        const isData = !isFunc && GSUtil.parseValue(val);

        if (isData || isJson) val = GSUtil.toJson(val);

        if (isFunc) {
            const isAsync = GSFunction.isFunctionAsync(func);
            if (isAsync) {
                val = await GSFunction.callFunctionAsync(func, this);
            } else {
                val = GSFunction.callFunction(func);
            }
        }

        if (!GSUtil.isJsonType(val)) return;

        return val;
    }

    static {
        Object.seal(GSLoader);
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Add JSON loader to datalist element
 * 
 * <datalist is="gs-ext-datalist" data="data.json">
 * 
 * [{text:'', value:'' selected:true}]
 * 
 * @class
 * @extends {HTMLDataListElement}
 */
class GSDataListExt extends HTMLDataListElement {

    static {
        customElements.define('gs-ext-datalist', GSDataListExt, { extends: 'datalist' });
        Object.seal(GSDataListExt);
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        //console.log(`name:${name}, oldValue:${oldValue}, newValue:${newValue}`);
        if (name === 'data') this.load(newValue);
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSComponents$1.store(me);
    }

    disconnectedCallback() {
        GSComponents$1.remove(this);
    }

    get owner() {
        const own = GSComponents$1.getOwner(this);
        return GSDOM$1.unwrap(own);
    }

    async load(url = '') {
        if (!url) return;
        const data = await GSLoader.loadSafe(url, 'GET', null, true);
        this.apply(data);
    }

    apply(data) {

        if (!Array.isArray(data)) return false;

        const me = this;

        requestAnimationFrame(() => {

            const list = [];
            data.forEach(o => {
                list.push(me.#objToHTML(o));
            });

            GSDOM$1.setHTML(me, list.join('\n'));
        });
        return true;
    }

    #objToHTML(o) {
        const seg = ['<option'];

        Object.entries(o).forEach(it => {
            const key = it[0];
            const val = it[1];
            if ('text' === key) return;
            if ('selected' === key) return seg.push(key);
            seg.push(`${key}="${val}"`);
        });

        seg.push(o.text);
        seg.push('>');

        return seg.join(' ');
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Add JSON loader to select element
 * <select is="gs-ext-select" data="data.json">
 * 
 * [{text:'', value:'' selected:true}]
 * 
 * @class
 * @extends {HTMLSelectElement}
 */
class GSComboExt extends HTMLSelectElement {

    static {
        customElements.define('gs-ext-select', GSComboExt, { extends: 'select' });
        Object.seal(GSComboExt);
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        //console.log(`name:${name}, oldValue:${oldValue}, newValue:${newValue}`);
        if (name === 'data') this.load(newValue);
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSComponents$1.store(me);
    }

    disconnectedCallback() {
        GSComponents$1.remove(this);
    }

    get owner() {
        const own = GSComponents$1.getOwner(this);
        return GSDOM$1.unwrap(own);
    }

    async load(url = '') {
        if (!url) return;
        const data = await GSLoader.loadSafe(url, 'GET', null, true);
        this.apply(data);
    }

    apply(data) {

        if (!Array.isArray(data)) return false;

        const me = this;

        requestAnimationFrame(() => {

            const list = [];
            data.forEach(o => {
                list.push(me.#objToHTML(o));
            });

            GSDOM$1.setHTML(me, list.join('\n'));
        });
        return true;
    }

    #objToHTML(o) {
        const seg = ['<option'];

        Object.entries(o).forEach(it => {
            const key = it[0];
            const val = it[1];
            if ('text' === key) return;
            if ('selected' === key) return seg.push(key);
            seg.push(`${key}="${val}"`);
        });

        seg.push('>');
        seg.push(o.text);
        seg.push('</option>');

        return seg.join(' ');
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDOMObserver class
 * @module base/GSDOMObserver
 */

/**
 * Generic HTMLElement node add/remove from DOM tree.
 * This Class accepts filter/callback function registration
 * as creation of independent observers for each Shadow DOM.
 * NOTE: Shadow dom must have independent observers!!!
 * Mostly used for dynamic attaching events to the elements not extended with is="gs-*"
 * @class
 * @extends MutationObserver
 */
class GSDOMObserver extends MutationObserver {

    static #filtersAdd = new Map();
    static #filtersDel = new Map();

    /**
     * Observe element for insertion / deletion
     * @param {HTMLElement} el A HTMLElement instance to observe for child changes
     * @param {object} opt A JSON configuration object
     * @returns {boolean} A satus of successfull observer registration
     */
    observe(el, opt) {
        const cfg = opt || { childList: true, subtree: true };
        return super.observe(el, cfg);
    }

    /**
     * Create a new observer instance for given root element
     * @param {HTMLElement} el An element to monitor for changes 
     * @returns {GSDOMObserver}
     */
    static create(el) {
        const observer = new GSDOMObserver(GSDOMObserver.#onObserve);
        observer.observe(el);
        return observer;
    }

    /**
     * Get add or remove filter
     * @param {boolean} forRemove If "true", return injection filter functions, elseremoval functions
     * @returns {Map<Function, Function>} Returns map of filter functions
     */
    static #getFilter(forRemove = false) {
        return forRemove ? GSDOMObserver.#filtersDel : GSDOMObserver.#filtersAdd;
    }

    /**
     * Is there any filter registered
     */
    static get #hasFilters() {
        return GSDOMObserver.#hasFiltersAdd || GSDOMObserver.#hasFiltersDel;
    }

    static get #hasFiltersAdd() {
        return GSDOMObserver.#filtersAdd.size > 0;
    }

    static get #hasFiltersDel() {
        return GSDOMObserver.#filtersDel.size > 0;
    }

    /**
     * Observer callback to filter elements
     * @param {*} mutations 
     */
    static #onObserve(mutations) {
        if (!GSDOMObserver.#hasFilters) return;
        mutations.forEach((mutation) => {
            if (GSDOMObserver.#hasFiltersAdd) mutation.addedNodes.forEach(el => GSDOMObserver.#walk(el, GSDOMObserver.#filtersAdd));
            if (GSDOMObserver.#hasFiltersDel) mutation.removedNodes.forEach(el => GSDOMObserver.#walk(el, GSDOMObserver.#filtersDel));
        });
    }

    /**
     * Walk node tree
     * @param {HTMLElement} rootEL node root
     * @param {Map} filters
     * @returns {boolean} 
     */
    static #walk(rootEL, filters) {
        if (filters.size === 0) return false;
        GSDOMObserver.#parse(rootEL, filters);
        rootEL.childNodes.forEach(el => GSDOMObserver.#walk(el, filters));
        return true;
    }

    /**
     * Call filter and callback function if node accepted
     * @param {HTMLElement} el node root
     * @param {Map} filters
     * @returns {void}
     */
    static #parse(el, filters) {
        filters.forEach((v, k) => {
            try {
                if (k(el)) v(el);
            } catch (e) {
                console.log(e);
            }
        });
    }

    /**
     * Execute observer logic 
     * 
     * @param {HTMLElement} el node root
     * @param {Function} filter function to filter nodes
     * @param {Function} callback function to be called on selected node
     * 
     * @returns {boolean}
     */
    static #exec(el, filter, callback) {
        if (el instanceof HTMLElement == false) return false;
        const tmp = new Map();
        tmp.set(filter, callback);
        return GSDOMObserver.#walk(el, tmp);
    }

    /**
     * Check if parameter is function
     * @param {function} fn 
     * @returns {boolean} true if parameter is function type
     */
    static #isFunction(fn) {
        return typeof fn === 'function';
    }

    /**
     * Check if registration functions are valid
     * @param {Function} filter function to filter nodes
     * @param {Function} callback function to be called on selected node
     * @returns {boolean}
     */
    static #isFunctions(filter, callback) {
        return GSDOMObserver.#isFunction(filter) && GSDOMObserver.#isFunction(callback);
    }

    /**
     * Register element filter
     * 
     * @param {Function} filter - filter function returns true
     * @param {Function} callback - result function
     * @param {boolean} forRemove - call on node remove or add
     * 
     * @returns {boolean} Returns true if filter registered
     */
    static registerFilter(filter, callback, forRemove = false) {

        if (!GSDOMObserver.#isFunctions(filter, callback)) return false;

        GSDOMObserver.#getFilter(forRemove).set(filter, callback);

        // initially loaded does not trigger 
        if (!forRemove) GSDOMObserver.#exec(document.body, filter, callback);

        return true;
    }

    /**
     * Unregister element filter
     * 
     * @param {Function} fn Filter function
     * @param {boolean} forRemove Call on node remove or add
     * 
     * @returns {boolean} Returns true if unregistered
     */
    static unregisterFilter(fn, forRemove = false) {
        return GSDOMObserver.#isFunction(fn) ? GSDOMObserver.#getFilter(forRemove).delete(fn) : false;
    }

    /**
     * Static constructor with default body monitoring
     */
    static {
        Object.freeze(GSDOMObserver);
        globalThis.GSDOMObserver = GSDOMObserver;
        const observer = GSDOMObserver.create(document.documentElement);
        globalThis.addEventListener('unload', () => { observer.disconnect(); });
    }

}


/*
GSDOMObserver.registerFilter((el)=>{ return el.tagName ==='DIV'}, (el) => {
    console.log(el);
});
*/

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Add custom form processing to support forms in modal dialogs
 * <form is="gs-ext-form">
 * @class
 * @extends {HTMLFormElement}
 */
class GSFormExt extends HTMLFormElement {

    static #actions = ['ok', 'reset', 'submit'];

    static {
        customElements.define('gs-ext-form', GSFormExt, { extends: 'form' });
        Object.seal(GSFormExt);
        GSDOMObserver.registerFilter(GSFormExt.#onMonitorFilter, GSFormExt.#onMonitorResult);
        GSDOMObserver.registerFilter(GSFormExt.#onMonitorFilter, GSFormExt.#onMonitorRemove, true);
    }

    static #onMonitorFilter(el) {
        return el instanceof HTMLFormElement && (el instanceof GSFormExt) === false;
    }

    static #onMonitorResult(el) {
        GSFormExt.#attachEvents(el);
    }

    static #onMonitorRemove(el) {
        GSEvent.deattachListeners(el);
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['mask'];
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSFormExt.#attachEvents(me);
        //GSComponents.store(me);
    }

    disconnectedCallback() {
        const me = this;
        //GSComponents.remove(me);
        GSEvent.deattachListeners(me);
    }

    static #attachEvents(me) {
        GSEvent.attach(me, me, 'submit', GSFormExt.#onSubmit.bind(me));
        GSEvent.attach(me, me, 'action', GSFormExt.#onAction.bind(me));
        GSEvent.attach(me, me, 'click', GSFormExt.#onAction.bind(me));
    }

    /**
     * 
     * @param {*} e 
     * @param {*} own 
     */
    static #onAction(e) {

        const el = e.composedPath().shift();
        const action = el?.dataset.action || e.detail.action || el?.type;
        if (!GSFormExt.#actions.includes(action)) return;

        GSEvent.prevent(e);
        const me = this;

        switch (action) {
            case 'reset':
                me.reset();
                break;
            case 'ok':
            case 'submit':
                GSFormExt.#onSubmit(e, me);
        }

    }

    /**
     * Trigger form submit only if form data is valid
     * @param {*} e 
     */
    static #onSubmit(e, own) {
        GSEvent.prevent(e);
        const me = own || this;
        const isValid = me.checkValidity() && me.isValid;
        if (!isValid) return me.reportValidity();
        const obj = GSDOM$1.toObject(me);
        const type = isValid ? 'submit' : 'invalid';
        const data = { type: type, data: obj, source: e, valid: isValid };
        GSEvent.send(me, 'form', data, true, true);
    }

    get isValid() {
        return GSDOM$1.queryAll(this, 'input,select,textarea')
            .map(el => el.checkValidity())
            .filter(v => v === false).length === 0;
    }

    get buttonOK() {
        return GSFormExt.#buttonOK(this);
    }

    get buttonCancel() {
        return GSFormExt.#buttonCancel(this);
    }

    get buttonReset() {
        return GSFormExt.#buttonReset(this);
    }

    static #buttonOK(own) {
        return GSDOM$1.query(own, 'button[type="submit"]');
    }

    static #buttonCancel(own) {
        return GSFormExt.#find(own, 'cancel');
    }

    static #buttonReset(own) {
        return GSFormExt.#find(own, 'reset');
    }

    static #find(own, name = '') {
        return GSDOM$1.query(own, `button[data-action="${name}"]`);
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Add custom field processing
 * <input is="gs-ext-input">
 * @class
 * @extends {HTMLInputElement}
 */
class GSInputExt extends HTMLInputElement {

    static #special = '.^$*+?()[]{}\|';

    static #maskType = {
        n: /[0-9]/g,
        x: /[0-9a-fA-F]/g,
        y: /[0-9]/g,
        m: /[0-9]/g,
        d: /[0-9]/g,
        '#': /[a-zA-Z]/g,
        '*': /[0-9a-zA-Z]/g,
        '_': /./g
    };

    #masks = [];

    static {
        customElements.define('gs-ext-input', GSInputExt, { extends: 'input' });
        Object.seal(GSInputExt);
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['mask', 'pattern'];
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        if (me.placeholder.length === 0) {
            if (me.mask) me.placeholder = me.mask;
        }
        me.#toPattern();
        me.#attachEvents();
        GSComponents$1.store(me);
        setTimeout(() => {
            me.#onDataChange();
        }, 250);
    }

    disconnectedCallback() {
        const me = this;
        GSComponents$1.remove(me);
        GSEvent.deattachListeners(me);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'mask' || name === 'pattern') this.#toPattern();
    }

    get owner() {
        const own = GSComponents$1.getOwner(this);
        return GSDOM$1.unwrap(own);
    }

    get list() {
        const me = this;
        const list = GSAttr.get(me, 'list');
        return GSDOM$1.getByID(me.owner, list);
    }

    get filter() {
        const me = this;
        const filter = GSAttr.get(me, 'data-filter');
        return GSDOM$1.getByID(me.owner, filter);
    }

    get mask() {
        return GSAttr.get(this, 'mask', '');
    }

    get strict() {
        return GSAttr.get(this, 'strict', '');
    }

    get optimized() {
        const me = this;
        const chars = me.mask.split('');

        const masks = [];
        let cnt = 0;
        chars.forEach((v, i) => {
            if (masks[masks.length - 1] === v) return cnt++;
            if (cnt > 0) masks.push(`{${++cnt}}`);
            cnt = 0;
            if (GSInputExt.#special.indexOf(v) > -1) masks.push('\\');
            masks.push(v);
        });
        if (cnt > 0) masks.push(`{${++cnt}}`);

        return masks.join('');
    }

    get autocopy() {
        return this.hasAttribute('autocopy');
    }

    get autoselect() {
        return this.hasAttribute('autoselect');
    }

    #toPattern() {
        const me = this;
        if (me.pattern.length > 0) return;
        if (me.mask.length === 0) return;

        const chars = me.mask.split('');
        const masks = ['^'];

        let cnt = 0;
        chars.forEach((v, i) => {
            const m = GSInputExt.#maskType[v.toLowerCase()];
            if (!m) {
                if (cnt > 0) masks.push(`{${++cnt}}`);
                cnt = 0;
                if (GSInputExt.#special.indexOf(v) > -1) masks.push('\\');
                return masks.push(v);
            }

            chars[i] = new RegExp(m, 'g');

            if (masks.length === 0) return masks.push(m.source);

            if (masks[masks.length - 1] === m.source) return cnt++;

            if (cnt > 0) masks.push(`{${++cnt}}`);
            cnt = 0;
            masks.push(m.source);
        });
        if (cnt > 0) masks.push(`{${++cnt}}`);
        masks.push('$');

        me.#masks = chars;
        me.pattern = masks.join('');
        me.maxLength = me.mask.length;
    }

    #attachEvents() {
        const me = this;
        GSEvent.attach(me, me, 'keydown', me.#onKeyDown.bind(me));
        GSEvent.attach(me, me, 'keypress', me.#onKeyPress.bind(me));
        GSEvent.attach(me, me, 'input', me.#onInput.bind(me));
        GSEvent.attach(me, me, 'change', me.#onChange.bind(me));
        GSEvent.attach(me, me, 'paste', me.#onPaste.bind(me));
        GSEvent.attach(me, me, 'blur', me.#onBlur.bind(me));
        GSEvent.attach(me, me, 'click', me.#onClick.bind(me));
        requestAnimationFrame(() => {
            const list = me.list;
            if (!list) return;
            GSEvent.attach(me, me, 'change', me.#onDataChange.bind(me));
            GSEvent.attach(me, me.filter, 'change', me.#onMonitor.bind(me));
        });
    }

    #togleEl(el, key = '', value = '') {
        const data = GSAttr.get(el, `data-${key}`, '').split(/[,;;]/);
        const isMatch = value.length > 0 && data.includes(value);
        const frmel = GSDOM$1.isFormElement(el.tagName);
        if (frmel) {
            GSAttr.toggle(el, 'disabled', !isMatch);
        } else {
            isMatch ? GSDOM$1.show(el) : GSDOM$1.hide(el);
        }
        GSDOM$1.queryAll(el, 'input,textarea,select').forEach(el => GSAttr.set(el, 'data-ignore', isMatch ? null : true));
    }

    isInList() {
        const me = this;
        const list = me.list;
        if (!list) return true;
        if (!me.strict) return true;
        if (!list.querySelector('option')) return true;
        const opt = list.querySelector(`option[value="${me.value}"]`);
        return opt != null;
    }

    /**
     * Monitor data list change to filter other elements visibilty
     * @param {*} e 
     */
    #onDataChange(e) {
        const me = this;
        const own = me.owner;
        let opt = GSDOM$1.query(me.list, `option[value="${me.value}"]`);
        let clean = false;
        if (!opt) {
            opt = me.list?.querySelector('option');
            clean = true;
        }

        const obj = opt?.dataset ||{};
        Object.entries(obj).forEach(p => {
            const val = clean ? '' : p[1];
            const key = p[0];
            me.setAttribute(`data-${key}`, p[1]);
            if (key === 'id' || key === 'group') return;

            const filter = `[data-${key}]:not([data-${key}=""]`;
            const els = Array.from(GSDOM$1.queryAll(own, filter));
            els.filter(el => el.tagName !== 'OPTION')
                .filter(el => el !== me)
                .filter(el => GSAttr.get(el, 'list').length === 0)
                .forEach(el => me.#togleEl(el, key, val));
        });
    }

    /**
     * Monitor parent field change for list filter 
     * @param {*} e 
     */
    #onMonitor(e) {
        const me = this;
        const list = me.list;
        me.value = '';
        const dataGroup = GSAttr.get(me.filter, 'data-group');
        GSDOM$1.queryAll(list, 'option').forEach(el => GSAttr.set(el, 'disabled', true));
        const filter = dataGroup ? `option[data-group="${dataGroup}"]` : `option[data-id="${e.target.value}"]`;
        GSDOM$1.queryAll(list, filter).forEach(el => GSAttr.set(el, 'disabled'));
    }

    #onClick(e) {
        const me = this;
        if (me.autocopy) navigator.clipboard.writeText(me.value);
        if (me.autoselect) me.select();
    }

    #onBlur(e) {
        const me = this;
        if (me.required) me.reportValidity();
        if (!me.isInList()) GSEvent.send(me, 'strict', { ok: false, source: e });
    }

    #onPaste(e) {
        GSEvent.prevent(e);
        const val = e.clipboardData.getData('text');
        const me = this;
        me.value = me.formatMask(val);
    }

    #onKeyDown(e) {
        const me = this;
        if (!me.mask) return;

        const tmp = me.value.split('');
        let pos1 = me.selectionStart;
        let pos2 = me.selectionEnd;

        let handle = false;
        let pos = pos1;

        if (e.key === 'Delete') {
            handle = true;
            tmp[pos] = me.mask[pos];
        }

        if (e.key === 'Backspace') {
            handle = true;
            if (pos1 === pos2) {
                tmp[pos - 1] = me.mask[pos - 1];
                pos = pos1 - 1;
            } else {
                pos = pos1;
            }
        }


        if (pos1 !== pos2 && e.key.length === 1) {
            handle = true;
            while (pos1 < pos2) {
                tmp[pos1] = me.mask[pos1];
                pos1++;
            }
        }

        if (!handle) return;

        me.value = me.formatMask(tmp.join(''));
        me.setSelectionRange(pos, pos);
        return GSEvent.prevent(e);

    }

    #onKeyPress(e) {
        const me = this;
        if (!me.mask) return;

        const tmp = me.value.split('');
        let pos = me.selectionStart;
        let masks = me.#masks.slice(pos);
        let canceled = true;

        masks.every(mask => {
            if (mask instanceof RegExp) {
                if (mask.test(e.key)) {
                    tmp[pos] = e.key;
                    canceled = false;
                }
                GSEvent.prevent(e);
                return false;
            } else {
                tmp[pos] = mask;
            }
            pos++;
            return true;
        });

        if (canceled) return;

        masks = me.#masks.slice(pos + 1);
        masks.every(mask => {
            if (mask instanceof RegExp) return false;
            pos++;
            return true;
        });


        me.value = me.formatMask(tmp.join(''));
        me.setSelectionRange(pos + 1, pos + 1);
        GSEvent.prevent(e);
    }

    #onChange(e) {
        const me = this;
        if (me.type !== 'range') return;
        me.title = me.value;
    }

    #onInput(e) {
        const me = this;
        if (me.type === 'number') return me.#onNumberInput(e);
        if (me.mask) return; //  me.#onMaskInput(me.value);
        if (me.type === 'text') return me.#onTextInput(e);
    }

    #onNumberInput(e) {
        const me = this;
        if (me.maxLength > 0 && me.value.length > me.maxLength) {
            me.value = me.value.substring(0, me.maxLength);
        }
    }

    #onTextInput(e) {
        const me = this;

        me.value = me.#updateText(me.value);

        if (!me.checkValidity()) {
            me.reportValidity();
        }
    }

    formatMask(value = '') {
        const me = this;
        const chars = value.split('');

        const tmp = [];
        let valid = false;

        me.mask.split('').every((v, i) => {
            const vld = me.#masks[i];

            if (GSUtil.isString(vld)) {
                tmp.push(vld);
                if (chars[0] === vld) chars.shift();
            }

            if (vld instanceof RegExp) {
                vld.lastIndex = 0;
                const c = chars.shift();
                valid = c && vld.test(c);
                tmp.push(valid ? c : v);
            }

            return true;
        });

        return me.#updateText(tmp.join(''));
    }

    #updateText(value = '') {
        const me = this;
        const fmt = me.computedStyleMap().get('text-transform').value;
        switch (fmt) {
            case 'lowercase':
                return value.toLocaleLowerCase();
            case 'uppercase':
                return value.toLocaleUpperCase();
            case 'capitalize':
                return GSUtil.capitalizeAll(value);
        }
        return value;
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Add Bootstrap item click / selection processsing.
 * For all A tags set as gs-ext-navlink type this class will toggle "active" class
 * <a is="gs-ext-navlink">
 * @class
 * @extends {HTMLAnchorElement}
 */
class GSNavLinkExt extends HTMLAnchorElement {

    static CSS_TAB_ACTIVE = "text-bg-primary";
    static CSS_TAB_INACTIVE = "text-bg-secondary";

    static {
        customElements.define('gs-ext-navlink', GSNavLinkExt, { extends: 'a' });
        Object.seal(GSNavLinkExt);
        GSDOMObserver.registerFilter(GSNavLinkExt.#onMonitorFilter, GSNavLinkExt.#onMonitorResult);
        GSDOMObserver.registerFilter(GSNavLinkExt.#onMonitorFilter, GSNavLinkExt.#onMonitorRemove, true);
    }

    static #onMonitorFilter(el) {
        let isValid = el instanceof HTMLElement && GSAttr.get(el, 'is') !== 'gs-ext-navlink';
        if (isValid) {
            const cl = el.classList;
            isValid = !el.hasAttribute('ignore') && (cl.contains('nav-link') || cl.contains('list-group-item'));

        }
        return isValid;
    }

    static #onMonitorResult(el) {
        GSNavLinkExt.#attachEvents(el);
    }

    static #onMonitorRemove(el) {
        GSEvent.deattachListeners(el);
    }

    constructor() {
        super();
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSNavLinkExt.#attachEvents(me);
        //GSComponents.store(me);
    }

    disconnectedCallback() {
        //GSComponents.remove(this);
        GSEvent.deattachListeners(this);
    }

    static #attachEvents(own) {
        GSEvent.attach(own, own, 'click', GSNavLinkExt.#onClick.bind(own));
    }

    static #onClick(e, own) {
        const me = own || this;
        const accept = me.dataset.selectable === 'false';
        if (accept) return GSNavLinkExt.#trigger(e, me);
        const nav = GSNavLinkExt.#nav(me);
        const list = GSNavLinkExt.#list(me);
        const panel = GSNavLinkExt.#panel(me);
        const panelItem = GSNavLinkExt.#panelItem(me);
        requestAnimationFrame(() => {
            if (list) list.querySelectorAll('.list-group-item').forEach(el => GSDOM$1.toggleClass(el, 'active', false));
            if (nav) nav.querySelectorAll('.nav-link').forEach(el => GSDOM$1.toggleClass(el, 'active', false));
            if (panel) panel.querySelectorAll('.tab-pane').forEach(el => GSDOM$1.toggleClass(el, 'active show', false));
            GSDOM$1.toggleClass(me, 'active', true);
            GSDOM$1.toggleClass(panelItem, 'active show', true);
            GSNavLinkExt.#trigger(e, me);
        });

    }

    static #trigger(e, el) {
        const own = GSNavLinkExt.#owner(el);
        const obj = { type: 'active', data: el.dataset, source: e };
        GSEvent.send(own, 'action', obj, true, true, true);
    }

    static #list(own) {
        return own.closest('.list-group');
    }

    static #nav(own) {
        return own.closest('.nav');
    }

    static #panel(own) {
        const item = GSNavLinkExt.#panelItem(own);
        return item ? item.closest('.tab-content') : null;
    }

    static #panelItem(own) {
        const nav = GSNavLinkExt.#nav(own);
        const tgtID = own?.dataset.bsTarget;
        return tgtID ? GSNavLinkExt.#owner(nav).querySelector(tgtID) : null;
    }

    static #owner(own) {
        const parent = GSComponents$1.getOwner(own);
        return GSDOM$1.unwrap(parent);
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Process Bootstrap data-bs-* attributes
 * toggle="offcanvas|collapse|dropdown|button|tab|pill|popover|modal|popup" 
 * dismiss="offcanvas|modal|alert|popup"
 * 
 * TODO : trigger events to document.body
 * @class
 */
class GSDataAttr {

    static #toggleValues = "offcanvas|collapse|dropdown|button|tab|pill|popover|modal|dialog|popup"; // tooltip|
    static #dismissValues = "offcanvas|modal|alert|popup|dialog";

    static {
        GSDOMObserver.registerFilter(GSDataAttr.#onMonitorFilter, GSDataAttr.#onMonitorResult);
        GSDOMObserver.registerFilter(GSDataAttr.#onMonitorFilter, GSDataAttr.#onMonitorRemove, true);
    }

    /**
     * Filter function for monitor observer
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    static #onMonitorFilter(el) {
        if (GSDOM$1.isGSElement(el)) return false;
        if (!GSDOM$1.isHTMLElement(el)) return false;
        if (GSDataAttr.#isCollapsible(el)) el.classList.add('collapsible');
        return el.dataset.bsDismiss
            || el.dataset.bsToggle
            || el.dataset.inject;
    }

    /**
     * Function to attach to the element
     * @param {HTMLElement} el 
     */
    static #onMonitorResult(el) {
        el.id = el.id || GSID.id;
        GSEvent.attach(el, el, 'click', GSDataAttr.#onClick.bind(el));
    }

    /**
     * Callback to element removal observer
     * @param {HTMLElement} el 
     */
    static #onMonitorRemove(el) {
        GSEvent.deattachListeners(el);
    }

    /**
     * Function to find data-bs- attributes walking up the treee
     * @param {HTMLElement} el 
     * @returns {HTMLElement}
     */
    static #toClicker(el) {
        if (!el) return;
        if (el.dataset?.bsToggle) return el;
        if (el.dataset?.bsDismiss) return el;
        if (el.dataset?.inject) return el;
        return GSDataAttr.#toClicker(el.parentElement);
    }

    /**
     * Callback to element clic kevennt
     * @param {Event} e
     */
    static #onClick(e) {
        const el = GSDataAttr.#toClicker(e.target);
        const inject = el?.dataset?.inject;
        const dismiss = el?.dataset?.bsDismiss;
        const target = GSDataAttr.getTarget(el);
        const toggle = el?.dataset?.bsToggle;
        GSDataAttr.#onToggle(el, target, toggle);
        GSDataAttr.#onDismiss(el, target, dismiss);
        GSDataAttr.#onInject(el, target, inject);
    }

    /**
     * Search for target to toggle or dismiss
     * @param {HTMLHtmlElement} el 
     * @param {string} target 
     * @param {string} type 
     * @return {Object} List of GSComponentes and html elements matched  {comps : [], list []}
     */
    static #findTarget(el, target, type) {

        switch (type) {
            case "alert":
                break;
            case "button":
                if (!target) return { list: [el], comps: [] };
                break;
            case "collapse":
                break;
            case "dropdown":
                break;
            case "modal":
                break;
            case "dialog":
                break;                
            case "offcanvas":
                break;
            case "pill":
                break;
            case "popover":
                break;
            case "poup":
                break;
            case "tab":
                break;
            case "tooltip":
                return { list: [], comps: [] };
        }

        let gs = GSDOM$1.queryAll(document.documentElement, `gs-${type}`);
        const css = target ? target : `.${type}`;
        if (target) {
            gs = gs.filter(el => el.matches(css));
        } else {
            el = el.closest(css);
            if (el) {
                const comps = gs.filter(c => c.self.firstElementChild === el);
                return { list: comps.length === 0 ? [el] : [], comps: comps };
            }
        }

        const allComps = GSDOM$1.queryAll(document.documentElement, css);
        const allRoot = Array.from(document.querySelectorAll(css));

        // all not descendants of component
        const all = allComps.concat(allRoot).filter(el => gs.indexOf(el) < 0).filter(el => gs.filter(c => c.self.firstElementChild === el).length === 0);

        return { list: Array.from(new Set(all)), comps: gs };
    }

    static #getByType(list, type) {
        return list.filter(el => GSDataAttr.#isType(el, type));
    }

    static #getHidden(list) {
        return list.filter(el => GSDataAttr.#isHidden(el));
    }

    static #getVisible(list, hidden) {
        return list.filter(el => !hidden.includes(el));
    }

    static #isType(el, type) {
        return type.split(' ').filter(v => v.trim()).map(v => v === 'button' ? 'btn' : v).filter(t => el.classList.contains(t)).length > 0;
    }

    static #isHidden(el) {
        return (el.classList.contains('hide') || el.classList.contains('fade') || el.classList.contains('collapse')) && !el.classList.contains('show');
    }

    static #isCollapsible(el) {
        return el.classList.contains('collapse') && !el.classList.contains('accordion-collapse');
    }

    static #faded(el) {
        return el.classList.contains('fade');
    }

    static #flip(el, pos, neg) {
        GSDOM$1.toggleClass(el, pos, true);
        GSDOM$1.toggleClass(el, neg, false);
    }

    static #hide(el) {
        const css = GSDataAttr.#isCollapsible(el) ? '' : 'fade';
        GSDataAttr.#flip(el, css, 'show');
    }

    static #show(el) {
        const css = GSDataAttr.#isCollapsible(el) ? 'gsanim' : 'fade';
        GSDataAttr.#flip(el, 'show', css);
    }

    static #toggle(obj, type) {

        const list = GSDataAttr.#getByType(obj.list, type);

        const objsH = GSDataAttr.#getHidden(list);
        const objsV = GSDataAttr.#getVisible(list, objsH);

        objsV.forEach(el => GSDataAttr.#hide(el));
        objsH.forEach(el => GSDataAttr.#show(el));
    }

    static async #removeEl(el) {
        GSDOM$1.toggleClass(el, 'show', false);
        if (GSDataAttr.#faded(el)) await GSUtil.timeout(GSDOM$1.SPEED);
        el.remove();
    }

    static #remove(obj) {
        obj.list.forEach(el => GSDataAttr.#removeEl(el));
    }

    /**
    * Automatic template injection at given target
    * @param {*} source caller 
    * @param {*} target css selector
    * @param {*} type type of target
    */
    static #onInject(source, target, inject) {

        if (!inject) return;

        const isComp = inject.toLowerCase().startsWith('gs-');
        const list = GSDOM$1.queryAll(document.documentElement, target);
        const css = source?.dataset?.css || '';

        const html = isComp ? `<${inject}></${inject}>` : `<gs-template href="${inject}" class="${css}"></gs-template>`;

        list.forEach(el => GSDOM$1.setHTML(el, html));
    }

    /**
     * Show or hide target based on type
     * @param {*} source caller 
     * @param {*} target css selector
     * @param {*} type type of target
     */
    static #onToggle(source, target, type) {

        if (!GSDataAttr.#isToggle(type)) return;

        const obj = GSDataAttr.#findTarget(source, target, type);

        obj.comps.filter(el => GSFunction.isFunction(el.toggle)).forEach(el => el.toggle(source));

        GSDataAttr.#onToggleBefore(source, target, type, obj);
        GSDataAttr.#toggle(obj, type);
        GSDataAttr.#onToggleAfter(source, target, type, obj);
    }

    static #onToggleBefore(source, target, type, obj) {
        return GSDataAttr.#onToggleHandler(source, target, type, obj, true);
    }

    static #onToggleAfter(source, target, type, obj) {
        return GSDataAttr.#onToggleHandler(source, target, type, obj, false);
    }

    static #onToggleHandler(source, target, type, obj, isBefore) {
        switch (type) {
            case "button":
                break;
            case "collapse":
                if (isBefore) {
                    obj.list.filter(el => el.classList.contains('accordion-collapse')).forEach(el => {
                        Array.from(el.closest('.accordion').querySelectorAll('.accordion-collapse'))
                            .filter(itm => itm != el && GSAttr.get(itm, 'data-bs-parent'))
                            .forEach(itm => GSDOM$1.toggleClass(itm, 'show', false));
                    });
                } else {
                    GSDOM$1.toggleClass(source, 'collapsed', null);
                }
                break;
            case "dropdown":
                if (isBefore) {
                    obj.list = obj.list.map(o => o.querySelector('.dropdown-menu')).filter(o => o != null);
                } else {
                    obj.list.forEach(o => o.classList.toggle('show'));
                    obj.list.filter(o => o.classList.contains('show')).forEach(o => GSDataAttr.#hideExt(o));
                }
                break;
        }
    }

    static #hideExt(source) {
        GSEvent.once(source, null, 'mouseleave', (e) => source.classList.remove('show'));
    }

    /**
     * Dismiss target based on type
     * @param {*} source caller 
     * @param {*} target css selector
     * @param {*} type type of target
     */
    static #onDismiss(source, target, type) {

        if (!GSDataAttr.#isDismiss(type)) return;

        const obj = GSDataAttr.#findTarget(source, target, type);

        obj.comps.filter(el => GSFunction.isFunction(el.close)).forEach(el => el.close());
        obj.comps.filter(el => GSFunction.isFunction(el.dismiss)).forEach(el => el.dismiss());


        switch (type) {
            case "alert":
                GSDataAttr.#remove(obj, type);
                break;
            case "modal":
            case "offcanvas":
            case "popup":
                GSDataAttr.#toggle(obj, type);
                break;
        }

    }

    static #isDismiss(val) {
        return val && GSDataAttr.#dismissValues.includes(val);
    }

    static #isToggle(val) {
        return val && GSDataAttr.#toggleValues.includes(val);
    }

    /**
     * Return data-bs-target attribute value for element
     * @param {HTMLElement} el 
     * @returns {string}
     */
    static getTarget(el) {
        const tgt = el?.dataset?.bsTarget || GSAttr.get(el, 'href');
        return tgt === '#' ? '' : tgt;
    }

    /**
     * Return dismiss css for element
     * @param {HTMLElement} el 
     * @returns {string}
     */
    static getDismiss(el) {
        return el?.dataset?.bsDismiss || '';
    }

    /**
     * Return toggle css value for element
     * @param {HTMLElement} el 
     * @returns {string}
     */
    static getToggle(el) {
        return el?.dataset?.bsToggle || '';
    }

    static getInject(el) {
        return el?.dataset?.inject || '';
    }

    /**
     * Return if element is dismissable
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    static isDismiss(el) {
        return el?.dataset?.bsDismiss ? true : false;
    }

    /**
     * Return if element is toggable
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    static isToggle(el) {
        return el?.dataset?.bsToggle ? true : false;
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A set of static functions used for loading resources
 * @class
 */
class GSData {

    /**
     * Removes duplicates from list
     * @param {Array} data 
     * @returns {Array}
     */
    static uniqe(data) {
        return Array.from(new Set(data));
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
     * Simple array merge, without duplicates. Used by observableAttributes
     * @param {Array} first 
     * @param {Array} second 
     * @returns {Array}
     */
    static mergeArrays(first = [], second = []) {
        return first.concat(second).filter((value, index, arr) => arr.indexOf(value) === index);
    }

    static filterData(filter, data, fields) {
        return filter.length === 0 ? data : data.filter(rec => GSData.filterRecord(rec, filter, fields));
    }

    static filterRecord(rec, filter, fields) {
        const isSimple = typeof filter === 'string';
        return isSimple ? GSData.filterSimple(rec, filter, fields) : GSData.filterComplex(rec, filter);
    }

    static filterSimple(rec, filter = '', fields) {
        filter = filter.toLowerCase();
        fields = fields || Object.keys(rec);
        let value = null;
        for (let key of fields) {
            value = rec[key];
            if (('' + value).toString().toLowerCase().includes(filter)) return true;
        }
        return false;
    }

    static filterComplex(rec, filter) {
        let found = true;
        let match = null;

        for (let flt of filter) {

            match = flt?.value?.toLowerCase();
            found = found && ('' + rec[flt.name]).toLocaleLowerCase().includes(match);
            if (!found) break;
        }

        return found;
    }

    static sortData(sort, data) {
        if (sort.length === 0) return data;
        return data.sort((a, b) => GSData.sortPair(a, b, sort));
    }

    static sortPair(a, b, sort) {
        const isArray = Array.isArray(a);
        let sts = 0;

        sort.forEach((o, i) => {
            if (!o) return;
            const idx = o.col || i;
            const key = isArray ? idx : o.name;
            const v1 = a[key];
            const v2 = b[key];

            sts = GSData.compare(v1, v2, o.ord, sts);
        });

        return sts;
    }

    static compare(v1, v2, order, sts) {
        if (GSUtil.isNumber(v1) && GSUtil.isNumber(v2)) {
            return sts || GSData.compareNum(v1, v2, order);
        } else if (GSUtil.isString(v1) || GSUtil.isString(v2)) {
            return sts || GSData.compareString(v1, v2, order);
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
        const s1 = (v1 || '').toString();
        const s2 = (v2 || '').toString();
        return ord < 0 ? s2.localeCompare(s1) : s1.localeCompare(s2);
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

    static {
        Object.seal(GSData);
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSEnvironment class
 * @module base/GSEnvironment
 */

/**
 * A set of static functions used for detecting browser encironment
 * such as OS, orientation, browser type etc.
 * @class
 */
class GSEnvironment {

    /**
     * Check if page is inside mobile device
     * @returns {boolean}
     */
    static get isMobile() {
        if (navigator.userAgentData) return navigator.userAgentData.mobile;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /** 
     * Check if page is inside desktop
     * @returns {boolean}
     */
    static get isDesktop() {
        return !GSEnvironment.isMobile;
    }

    static get isWebkit() {
        return /webkit/.test(navigator.userAgent.toLowerCase());
    }

    /**
     * Check if value match current URL scheme
     * @param {*} val 
     */  
    static isValidProtocol(val = '') {
        if (!val) return true;
        return location.protocol.slice(0, -1) === val;
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
                if (v.brand.toLowerCase().includes(strVal)) {
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
            return GSEnvironment.isDesktop;
        }

        if (val === 'mobile') {
            return GSEnvironment.isMobile;
        }

        return GSEnvironment.isDevice(val);
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

        if (otype.includes('portrait')) {
            return val === 'portrait' || val === 'vertical';
        }

        if (otype.includes('landscape')) {
            return val === 'landscape' || val === 'horizontal';
        }

        return true;
    }

    static {
        Object.seal(GSEnvironment);
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Base element inherited by all other registered GS-Elements
 * Contains main rendering logic
 * @class
 * @extends HTMLElement
 */
class GSElement extends HTMLElement {

	#ready = false;
	#removed = false;
	#content = null;
	#observer = null;

	#proxied = false;
	#opts = null;

	static {
		customElements.define('gs-element', GSElement);
	}

	constructor() {
		super();
	}

	static observeAttributes(attributes) {
		return GSData.mergeArrays(attributes, GSElement.observedAttributes);
	}

	/**
	 * List of observable element attributes
	 * @returns {Array<string>} Monitored attributes orientation|id
	 */
	static get observedAttributes() {
		return ['orientation', 'id'];
	}

	/**
	 * Get this class name
	 */
	get clazzName() {
		return this.constructor.name;
	}

	/**
	 * Template used to render component. Might be various types
	 * 1. URL to load template from
	 * 2. function to be called to receive template
	 * 3. id of a template tag containing a template
	 * 4. template source stating with "<" and ending with ">"
	 * 
	 * @returns {string} 
	 */
	get template() {
		return GSAttr.get(this, 'template', '');
	}

	set template(val) {
		GSAttr.set(this, 'template', val);
	}

	/**
	 * Return if this component uses shadow DOM or flat - directly injected into a page
	 * If set to true, use anchor attribute to determine where to inject
	 * @returns {boolean} 
	 */
	get isFlat() {
		return GSUtil.FLAT || GSAttr.getAsBool(this, 'flat');
	}

	/**
	 * Check if element is proxied to another target
	 */
	get isProxy() {
		return this.#proxied;
	}

	/**
	 * Check if element is referenced by proxy element
	 * @returns {string|boolean} Return proxy component id or false if not referenced
	 */
	get proxy() {
		return GSAttr.get(this, 'proxy', false);
	}

	/**
	 * Envrionment where to render component
	 *  - blank - always render
	 *  - mobile - only on mobile devices
	 *  - tablet - only on tablet devices
	 *  - desktop - only on desktop devices
	 * @returns {string} 
	 */
	get environment() {
		return GSAttr.get(this, 'environment', '');
	}

	set environment(val) {
		GSAttr.set(this, 'environment', val);
	}

	/**
	 * Browser OS where to render component
	 * @returns {string} 
	 */
	get os() {
		return GSAttr.get(this, 'os', '');
	}

	set os(val) {
		GSAttr.set(this, 'os', val);
	}

	/**
	 * Browser type, if not matched do not render
	 * chrome, edge, ie, firefox, ...
	 * @returns {string} 
	 */
	 get browser() {
		return GSAttr.get(this, 'browser', '');
	}

	set browser(val) {
		GSAttr.set(this, 'browser', val);
	}

	/**
	 * Browser type, if not matched do not render
	 * chrome, edge, ie, firefox, ...
	 * @returns {string} 
	 */
	 get protocol() {
		return GSAttr.get(this, 'protocol', '');
	}

	set protocol(val) {
		GSAttr.set(this, 'protocol', val);
	}	

	/**
	 * Orientation where to render component
	 *  - blank - always render
	 *  - vertical | portrait
	 *  - horizontal | landscape
	 * @returns {string} 
	 */
	get orientation() {
		return GSAttr.get(this, 'orientation', '');
	}

	set orientation(val) {
		GSAttr.set(this, 'orientation', val);
	}

	/**
	 * Function to be called when component is ready.
	 * NOTE: namespace is supported also
	 * @returns {string}  Functio name
	 */
	get onready() {
		return GSAttr.get(this, 'onready', '');
	}

	set onready(val) {
		GSAttr.set(this, 'onready', val);
	}

	/**
	 * Returns if environment matched
	 * dektop, mobile, tablet, android, linux, winwdows, macos
	 * @returns {boolean} 
	 */
	get isValidEnvironment() {
		return GSEnvironment.isValidEnvironment(this.environment);
	}

	/**
	 * Return true if element can be rendered bysed on OS matching
	 * @returns {boolean} 
	 */
	get isValidOS() {
		return GSEnvironment.isDevice(this.os);
	}

	/**
	 * Returns if orientation matched for element rendering
	 * @returns {boolean} 
	 */
	get isValidOrientation() {
		return GSEnvironment.isValidOrientation(this.orientation);
	}

	/**
	 * Returns if browser matched, used to determine rendering/removal
	 * @returns {boolean} 
	 */
	get isValidBrowser() {
		return GSEnvironment.isValidBrowser(this.browser);
	}

	/**
	 * Returns if browser matched, used to determine rendering/removal
	 * @returns {boolean} 
	 */
	 get isValidProtocol() {
		return GSEnvironment.isValidProtocol(this.protocol);
	}

	/**
	 * Returns owner of this shadowRoot element
	 * @returns {HTMLElement|ShadowRoot} 
	 */
	get owner() {
		return GSComponents$1.getOwner(this);
	}

	/**
	 * Return if element is removed from DOM tree
	 * @returns {boolean} 
	 */
	get offline() {
		return this.#removed;
	}

	/**
	 * Return if element is attached to a DOM tree
	 * @returns {boolean} 
	 */
	get online() {
		return !this.#removed;
	}

	/**
	 * If component rendered
	 */
	get ready() {
		return this.#ready;
	}

	/**
	 * Where to position flat element
	 * HTML insertAdjacent value or *(gs-block) or self(within)
	 * Format position | position@target (self)
	 * @returns {string}  Values parent|self|unwrap|[html insertion position]
	 */
	get anchor() {
		const me = this;
		const dft = 'beforeend@self';
		return me.proxy ? dft : GSAttr.get(this, 'anchor', dft);
	}

	/**
	 * Avaialble only after render, after template is applied
	 * @returns {ShadowRoot|HTMLElement} 
	 */
	get self() {
		const me = this;
		return me.isProxy && me.#content instanceof GSElement ? me.#content.self : me.#content;
	}

	/**
	 * Update shareable stylesheet on change
	 */
	updateUI() {
		const me = this;
		if (!me.shadowRoot) return;
		me.shadowRoot.adoptedStyleSheets = GSCacheStyles.styles;
		GSEvent.send(document.body, 'i18n', me.shadowRoot);
	}

	/**
	 * Retrieve custom style for rendered items, does not apply to this element.
	 * @returns {string}
	 */
	getStyle() {
		return GSAttr.get(this, 'style', '');
	}

	/**
	 * Find element by its ID
	 * @param {string} name 
	 * @returns {HTMLElement}
	 */
	getByID(query = '') {
		return GSDOM$1.getByID(this, query);
	}

	/**
	 * Find closest top element by CSS selector
	 * @param {string} query 
	 * @returns {HTMLElement}
	 */
	closest(query = '') {
		return GSDOM$1.closest(this, query);
	}

	/**
	 * Find element by CSS selector (top level is this element)
	 * @param {string} name 
	 * @returns {HTMLElement}
	 */
	query(query = '', all = false) {
		const me = this;
		const el = GSDOM$1.query(me.self, query, all, true);
		if (me.isProxy || el) return el;
		return GSDOM$1.query(me, query, all, false);
	}

	/**
	 * Find multiple elements by CSS selector (top level is this element)
	 * @param {string} query 
	 * @returns {Array<HTMLElement>}
	 */
	queryAll(query = '', all = false) {
		const me = this;
		const list = GSDOM$1.queryAll(me.self, query, all, true);
		if (me.isProxy || list.length > 0) return list;
		return GSDOM$1.queryAll(me, query, all, false);
	}

	/**
	 * Used for override to get predefined template
	 * Can be html source or url, checks if load or not
	 * @async
	 * @returns {Promisa<string>}
	 */
	async getTemplate(def = '') {
		return GSLoader.getTemplate(def);
	}

	/**
	 * Hide current component
	 * @param {boolean} orientation 
	 */
	hide(orientation = false) {
		GSDOM$1.hide(this, orientation);
	}

	/**
	 * Show current component
	 * @param {boolean} orientation 
	 */
	show(orientation = false) {
		GSDOM$1.show(this, orientation);
	}

	/**
	 * Wait for event to happen
	 * @async
	 * @param {string} name 
	 * @returns {Promisa}
	 */
	async waitEvent(name = '') {
		if (!name) throw new Error('Event undefined!');
		const me = this;
		return new Promise((r, e) => {
			me.once(name, (evt) => r(evt.detail));
		});
	}

	/**
	 * Listen once for triggered event
	 * @param {string} name  A name of the event
	 * @param {Function} func A callback function on event trigger
	 */
	once(name, func) {
		return this.listen(name, func, true);
	}

	/**
	 * Alternative function for event listen
	 * @param {string} name  A name of the event
	 * @param {Function} func A callback function on event trigger
	 * @returns {boolean}
	 */
	on(name, func, once = false) {
		return this.listen(name, func, once);
	}

	/**
	 * Alternative function for event unlisten
	 * @param {string} name  A name of the event
	 * @param {Function} func A callback function on event trigger
	 * @returns {boolean}
	 */
	off(name, func) {
		return this.unlisten(name, func);
	}

	/**
	 * Attach event to this element
	 * @param {string} name  A name of the event
	 * @param {Function} func A callback function on event trigger
	 * * @returns {boolean}
	 */
	listen(name, func, once = false) {
		return this.attachEvent(this, name, func, once);
	}

	/**
	 * Remove event from this element
	 * @param {string} name  A name of the event
	 * @param {Function} func A callback function on event trigger
	 * @returns {boolean}
	 */
	unlisten(name, func) {
		return this.removeEvent(this, name, func);
	}

	/**
	* Generic event listener appender
	* 
	* @param {HTMLElement} el Element on which to monitor for named events
	* @param {string} name Event name to watch for
	* @param {Function} fn Event trigger callback
	* @param {boolean} once Listen only once
	* @returns {boolean} State if attachment was successful
	*/
	attachEvent(el, name = '', fn, once = false) {
		return GSEvent.attach(this, el, name, fn, once);
	}

	/**
	* Generic event listener remove
	* @param {HTMLElement} el Element on which to monitor for named events
	* @param {string} name Event name to watch for
	* @param {Function} fn Event trigger callback
	* @returns {boolean} State if attachment was successful	
	*/
	removeEvent(el, name = '', fn) {
		return GSEvent.remove(this, el, name, fn);
	}

	/**
	 * Check if element is allowed to be rendered
	 */
	get isAllowRender() {
		const me = this;
		return me.isValidEnvironment && me.isValidBrowser && me.isValidOS && me.isValidProtocol;
	}

	/**
	 * Called when element injected to parent DOM node
	 */
	connectedCallback() {
		const me = this;

		if (me.#isConfig()) return;

		if (!me.isAllowRender) {
			return me.remove();
		}

		if (!me.id) me.id = GSID.id;
		me.#opts = me.#injection();
		me.#proxied = me.#opts.ref;
		GSComponents$1.store(me);
		requestAnimationFrame(() => me.#render());
	}

	/**
	 * Called when element removed from parent DOM node
	 */
	disconnectedCallback() {
		const me = this;
		me.#removed = true;
		if (me.#observer) me.#observer.disconnect();
		GSComponents$1.remove(me);
		GSEvent.deattachListeners(me);
		me.#removeFlat();
		me.#observer = null;
		me.#content = null;
		me.#opts = null;
	}

	/**
	 * Called when element attribute changed
	 * 
	 * @param {string} name  Attribute name
	 * @param {string} oldValue Old value before change
	 * @param {string} newValue New value after change
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		const me = this;
		if (name === 'orientation') me.#onOrientation();
		if (name === 'id') {
			GSComponents$1.remove(oldValue);
			GSComponents$1.store(me);
		}
		if (me.#ready) {
			GSUtil.requestAnimationFrame(() => {
				me.attributeCallback(name, oldValue, newValue);
			});
		}
	}

	/**
	 * Used on top classes to be called under animation frame to update UI
	 * @param {*} name 
	 * @param {*} oldValue 
	 * @param {*} newValue 
	 */
	attributeCallback(name, oldValue, newValue) {

	}

	/**
	 * Called when element fully rendered
	 * @returns {void}
	 */
	onReady() {
		const me = this;
		if (me.offline) return;
		me.#ready = true;
		const fn = GSFunction.parseFunction(me.onready);
		GSFunction.callFunction(fn);
		GSEvent.send(document.body, 'componentready', me);
	}

	/**
	 * Update UI state if orientation changes
	 */
	#onOrientation(e) {
		const me = this;
		GSUtil.requestAnimationFrame(() => {
			if (me.offline) return;
			me.isValidOrientation ? me.show(true) : me.hide(true);
		});
	}

	#isConfig() {
		const me = this;
		const pe = GSComponents$1.getOwner(me, GSElement);
		return pe && pe.isProxy;
	}

	#styleChange() {
		const me = this;
		GSUtil.requestAnimationFrame(() => {
			me.updateUI();
		});
	}

	/**
	 * Get element shadowRoot, autocreate if does not exist
	 * @returns {ShadowRoot} 
	 */
	get #shadow() {
		const me = this;
		if (!me.shadowRoot) {
			me.attachShadow({ mode: 'open' });
			me.#observer = GSDOMObserver.create(me.#shadow);
			me.updateUI();
		}
		return me.shadowRoot;
	}

	get #useTemplate() {
		const me = this;
		return (me.#proxied && me.isFlat) || !me.#proxied;
	}

	/**
	 * Internal function to handle loaded template
	 * @async
	 * @returns {Promise}
	 */
	async #aplyTemplate() {

		const me = this;

		if (me.offline) return;

		const useTpl = me.#useTemplate;
		const src = useTpl ? await me.getTemplate(me.template) : me.outerHTML;

		await GSEvent.waitAnimationFrame(() => {

			if (me.offline) return;

			const inject = me.#opts;

			if (me.#proxied) {
				if (useTpl) {
					me.#content = GSDOM$1.parseWrapped(me, src, true);
				} else {
					me.#content = GSDOM$1.parse(src, true);
					me.#content.id = me.id;
					me.id = GSID.id;
				}
				GSDOM$1.link(me, me.#content);
				GSDOM$1.insertAdjacent(inject.target, me.#content, inject.anchor);
				return;
			}

			if (inject.target === me) {
				if (me.isFlat) {
					if (src) {
						const tpl = GSDOM$1.parseWrapped(me, src, false);
						me.#content = tpl;
						GSDOM$1.insertAdjacent(inject.target, tpl, inject.anchor);
					} else {
						me.#content = me;
					}
				} else {
					me.#content = me.#shadow;
					GSDOM$1.setHTML(me.#content, src);
				}
				return;
			}


			if (inject.target === me.parentElement) {
				me.#content = me.isFlat ? me : me.#shadow;
				GSDOM$1.setHTML(me.#content, src);
				return;
			}

			me.#content = GSDOM$1.parseWrapped(me, src, true);
			GSDOM$1.link(me, me.#content);
			GSDOM$1.insertAdjacent(inject.target, me.#content, inject.anchor);

		});
		me.updateUI();
	}

	#injection() {

		const me = this;
		const tpl = me.anchor;
		const idx = tpl.indexOf('@');

		let anchor = idx > 0 ? tpl.slice(0, idx) : tpl;
		let target = idx > 0 ? tpl.slice(idx + 1) : 'self';

		if (anchor === 'self' || anchor === 'parent') {
			target = target ? target : anchor;
			anchor = null;
		}

		anchor = GSUtil.normalize(anchor, 'beforeend');
		target = GSUtil.normalize(target, 'self');

		let el = null;
		switch (target) {
			case 'self':
				el = me;
				break;
			case 'parent':
				el = me.parentElement;
				break;
			default:
				el = GSDOM$1.query(document.documentElement, target);
		}

		if (!el) {
			const msg = `Injection point not available!\nElement: ${me.tagName}, Id:${me.id}, tgt:${target}`;
			GSLog.error(me, msg);
			throw new Error(msg);
		}

		const ref = !(el === me || el === me.parentElement);

		return {
			anchor: anchor,
			target: el,
			ref: ref
		};
	}

	#removeFlat() {
		const me = this;
		if (me.#content && me.#content.remove) {
			me.#content.remove();
			me.#content = null;
		}
	}

	/**
	 * Render component in DOM
	 * 
	 * @async
	 * @returns {Promise}
	 */
	async #render() {
		const me = this;
		// await GSEvent.waitPageLoad();
		await me.#aplyTemplate();
		if (me.offline) return;
		if (!me.#useTemplate) return;
		if (!me.isFlat) me.attachEvent(document, 'gs-style', me.#styleChange.bind(me));
		me.attachEvent(screen.orientation, 'change', me.#onOrientation.bind(me));
		GSUtil.requestAnimationFrame(() => me.onReady());
	}

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module rendering current time on a page
 * @module components/GSTimeFormat
 */

/**
 * Render Time value
 * 
 * @class
 * @extends {HTMLElement}
 */
class GSTimeFormat extends GSElement {

    #id = 0;

    static get observedAttributes() {
        return ['interval'];
    }

    attributeChanged(name = '', oldVal = '', newVal = '') {
        const me = this;
        me.stop();
        me.start();
        me.#update();
    }

    onReady() {
        super.onReady();
        const me = this;
        me.#update();
        me.start();
    }

    disconnectedCallback() {
        this.stop();
    }

    #update() {
        const me = this;
        const date = new Date();
        const src = date.toLocaleTimeString(me.locale);
        GSDOM$1.setHTML(me.self, src);
        GSEvent.send(me, 'time', { date }, true, true);
        return 0;
    }

    start() {
        const me = this;
        me.#id = me.interval > 0 ? setInterval(me.#update.bind(me), me.interval * 1000) : me.#update();
    }

    stop() {
        clearInterval(this.#id);
    }

    get isFlat() {
        return true;
    }

    get interval() {
        return GSAttr.getAsNum(this, 'interval', 1);
    }

    set interval(val = 60) {
        return GSAttr.setAsNum(this, 'interval', val);
    }

    get locale() {
        return GSAttr.get(this, 'locale', GSUtil.locale);
    }

    set locale(val = '') {
        return GSAttr.set(this, 'locale', val);
    }

    static {
        customElements.define('gs-time-format', GSTimeFormat);
        Object.seal(GSTimeFormat);
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDate class
 * @module base/GSDate
 */

/**
 * Custom Date class to help handling calendar and date formatting
 * 
 * @class
 */
class GSDate extends Date {

    static DEFAULT_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
    static REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g

    #locale = navigator.locale;

    format(val = GSDate.DEFAULT_FORMAT, locale) {
        const me = this;
        me.locale = locale;
        const obj = me.asJSON();
        return val.replace(GSDate.REGEX_FORMAT, (match, val) => val || obj[match]);
    }

    /**
     * Build array days/weeks for a month
     * @returns {Array<string>}
     */
    build() {
        const me = this;
        const last = me.last.getDate();
        const first = me.first.getDay();

        const mondayFirst = me.#isMondayFirst();

        const shifter = mondayFirst ? -2 : -1;
        const days = first === 0 ? [] : ' '.repeat(first + shifter).split(' ');
        let i = 1;
        while (i <= last) {
            days.push(i.toString());
            i++;
        }

        while (days.length % 7 != 0) days.push('');

        return days;
    }

    get locale() {
        return this.#locale;
    }

    set locale(val) {
        this.#locale = val || navigator.language;
    }

    get year() {
        return this.getFullYear();
    }

    set year(val = 0) {
        this.setFullYear(val);
    }

    get month() {
        return this.getMonth();
    }

    set month(val = 0) {
        this.setMonth(val);
    }

    get day() {
        return this.getDate();
    }

    set day(val = 0) {
        this.setDate(val);
    }

    /**
     * First date of the month
     * @returns {Date}
     */
    get first() {
        return new GSDate(this.getFullYear(), this.getMonth(), 1);
    }

    /**
     * Last date of the month
     * @returns {Date}
     */
    get last() {
        return new GSDate(this.getFullYear(), this.getMonth() + 1, 0);
    }

    get YY() {
        return String(this.YYYY).slice(-2);
    }

    get YYYY() {
        return this.getFullYear();
    }

    get M() {
        return this.getMonth() + 1;
    }

    get MM() {
        return this.M.toString().padStart(2, '0');
    }

    get MMM() {
        return this.#toLocale({ month: 'short' });
    }

    get MMMM() {
        return this.#toLocale({ month: 'long' });
    }

    get D() {
        return this.getDate().toString();
    }

    get DD() {
        return this.D.padStart(2, '0');
    }

    get d() {
        return this.getDay().toString();
    }

    get dd() {
        return this.ddd.slice(0, 2);
    }

    get ddd() {
        return this.#toLocale({ weekday: 'short' });
    }

    get dddd() {
        return this.#toLocale({ weekday: 'long' });
    }

    get H() {
        return this.getHours().toString();
    }

    get HH() {
        return this.H.padStart(2, '0');
    }

    get h() {
        return this.#formatHour(1);
    }

    get hh() {
        return this.#formatHour(2);
    }

    get a() {
        return this.#meridiem(true);
    }

    get A() {
        return this.#meridiem(false);
    }

    get m() {
        return this.getMinutes().toString();
    }

    get mm() {
        return this.m.padStart(2, '0');
    }

    get s() {
        return this.getSeconds().toString();
    }

    get ss() {
        return this.s.padStart(2, '0');
    }

    get SSS() {
        return this.getMilliseconds().toString().padStart(3, '0');
    }

    get Z() {
        return this.#zoneStr();
    }

    get ZZ() {
        return this.Z.replace(':', '');
    }

    get Q() {
        return Math.ceil(this.M / 3);
    }

    get k() {
        return (this.getHours() + 1).toString();
    }

    get kk() {
        return this.k.padStart(2, '0');
    }

    get W() {
        const date = new Date(this.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    get WW() {
        return this.W.toString().padStart(2, '0');
    }

    get x() {
        return this.getTime();
    }

    get X() {
        return Math.floor(this.x / 1000);
    }

    asJSON() {
        const me = this;
        return {
            YY: me.YY,
            YYYY: me.YYYY,
            M: me.M,
            MM: me.MM,
            MMM: me.MMM,
            MMMM: me.MMMM,
            D: me.D,
            DD: me.DD,
            d: me.d,
            dd: me.dd,
            ddd: me.ddd,
            dddd: me.dddd,
            H: me.H,
            HH: me.HH,
            h: me.h,
            hh: me.hh,
            a: me.a,
            A: me.A,
            m: me.m,
            mm: me.mm,
            s: me.s,
            ss: me.ss,
            SSS: me.SSS,
            Z: me.Z,
            ZZ: me.ZZ,
            Q: me.Q,
            k: me.k,
            kk: me.kk,
            W: me.W,
            WW: me.WW,
            x: me.x,
            X: me.X
        }
    }

    static monthList(short = false, locale = navigator.locale, capitalize = true) {
        const tmp = new GSDate();
        tmp.locale = locale;
        tmp.setMonth(0);
        const days = [];
        let val = null;
        let d = 12;
        while (d--) {
            val = short ? tmp.MMM : tmp.MMMM;
            val = capitalize ? tmp.#capitalize(val) : val;
            days.push(val);
            tmp.setMonth(tmp.getMonth() + 1);
        }
        return days;
    }

    static dayList(short = false, locale = navigator.locale, capitalize = true) {
        const tmp = new GSDate();
        tmp.locale = locale;
        const mondayFirst = tmp.#isMondayFirst();
        const offset = mondayFirst ? 1 : 0;
        tmp.setDate(tmp.getDate() - tmp.getDay() + offset);
        const days = [];
        let val = null;
        let d = 7;
        while (d--) {
            val = short ? tmp.ddd : tmp.dddd;
            val = capitalize ? tmp.#capitalize(val) : val;
            days.push(val);
            tmp.setDate(tmp.getDate() + 1);
        }
        return days;
    }

    #isMondayFirst() {
        // TODO Firefox does not support it
        return new Intl.Locale(this.#locale)?.weekInfo?.firstDay === 1;
    }

    #capitalize(val = '') {
        return val.charAt(0).toUpperCase() + val.slice(1);
    }

    #toLocale(opt) {
        return this.toLocaleString(this.#locale, opt);
    }

    #formatHour(size) {
        return (this.getHours() % 12 || 12).toString().padStart(size, '0');
    }

    #meridiem(isLowercase) {
        const opt = { hour: '2-digit', hour12: true };
        const val = this.#toLocale(opt).split(' ').pop(-1);
        return isLowercase ? val.toLowerCase() : val;
    }

    #zoneStr() {
        const me = this;
        const negMinutes = -1 * me.getTimezoneOffset();
        const minutes = Math.abs(negMinutes);
        const hourOffset = Math.floor(minutes / 60);
        const minuteOffset = minutes % 60;

        const seg1 = negMinutes <= 0 ? '+' : '-';
        const seg2 = hourOffset.toString().padStart(2, '0');
        const seg3 = minuteOffset.toString().padStart(2, '0');

        return `${seg1}${seg2}:${seg3}`;
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Render Date value with international language support
 * 
 * All options - set dasta-[name]; data-weekday etc...
       {
       weekday: 'narrow' | 'short' | 'long',
       era: 'narrow' | 'short' | 'long',
       year: 'numeric' | '2-digit',
       month: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
       day: 'numeric' | '2-digit',
       hour: 'numeric' | '2-digit',
       minute: 'numeric' | '2-digit',
       second: 'numeric' | '2-digit',
       timeZoneName: 'short' | 'long',

       // Time zone to express it in
       timeZone: 'Asia/Shanghai',
       // Force 12-hour or 24-hour
       hour12: true | false,

       dateStyle: full | long | medium | short
       timeStyle: full | long | medium | short

       // Rarely-used options
       hourCycle: 'h11' | 'h12' | 'h23' | 'h24',
       formatMatcher: 'basic' | 'best fit'
       }
 * @class
 * @extends {HTMLElement}
 */
class GSDateFormat extends HTMLElement {

    static observedAttributes = ['value', 'locale', 'format'];

    #id = 0;

    connectedCallback() {
        this.#update();
    }

    attributeChangedCallback(name = '', oldVal = '', newVal = '') {
        this.#update();
    }

    #update() {
        const me = this;
        if (me.#id > 0) return;
        me.#id = setTimeout(() => {
            GSDOM$1.setHTML(me, me.result);
            me.#id = 0;
        }, 50);
    }

    get result() {
        const me = this;
        const val = me.value;
        if (me.format) return val.format(me.format);
        return new Intl.DateTimeFormat(me.locale, me.dataset).format(val);
    }

    get format() {
        return GSAttr.get(this, 'format');
    }

    set format(val = '') {
        return GSAttr.set(this, 'format', val);
    }

    get value() {
        const me = this;
        const o = Date.parse(GSAttr.get(me, 'value'));
        const date = new GSDate(o);
        date.locale = me.locale;
        return date;
    }

    set value(val = '') {
        GSAttr.set(this, 'value', val);
    }

    get locale() {
        return GSAttr.get(this, 'locale', navigator.locale);
    }

    set locale(val = '') {
        GSAttr.set(this, 'locale', val);
    }

    static {
        customElements.define('gs-date-format', GSDateFormat);
        Object.seal(GSDateFormat);
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Render Year value
 * 
 * @class
 * @extends {HTMLElement}
 */
class GSYearFormat extends HTMLElement {

    static observedAttributes = ['offset'];

    connectedCallback() {
        this.#update();
    }

    attributeChangedCallback(name = '', oldVal = '', newVal = '') {
        this.#update();
    }

    #update() {
        GSDOM$1.setHTML(this, this.value);
    }

    get value() {
        return this.current + this.offset;
    }

    get current() {
        return new Date().getFullYear();
    }

    get offset() {
        return GSAttr.getAsNum(this, 'offset', 0);
    }

    set offset(val = '0') {
        GSAttr.setAsNum(this, 'offset', val);
    }

    static {
        customElements.define('gs-year-format', GSYearFormat);
        Object.seal(GSYearFormat);
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Render Year value
 * 
 * @class
 * @extends {HTMLElement}
 */
class GSCurrencyFormat extends HTMLElement {

    static observedAttributes = ['value', 'locale', 'currency'];

    #id = 0;

    connectedCallback() {
        this.#update();
    }

    attributeChangedCallback(name = '', oldVal = '', newVal = '') {
        this.#update();
    }

    #update() {
        const me = this;
        if (me.#id > 0) return;
        me.#id = setTimeout(() => {
            GSDOM$1.setHTML(me, me.format);
            me.#id = 0;
        }, 50);
    }

    get #options() {
        const me = this;
        return Object.apply(me.dataset, { style: 'currency', currency: me.currency });
    }

    get format() {
        const me = this;
        return new Intl.NumberFormat(me.locale, me.#options).format(me.value);
    }

    get value() {
        return GSAttr.getAsNum(this, 'value', 0);
    }

    set value(val = '') {
        GSAttr.setAsNum(this, 'value', val);
    }

    get locale() {
        return GSAttr.get(this, 'locale', navigator.language);
    }

    set locale(val = '') {
        GSAttr.set(this, 'locale', val);
    }

    get currency() {
        return GSAttr.get(this, 'currency', '');
    }

    set currency(val = '') {
        GSAttr.set(this, 'currency', val);
    }

    static {
        customElements.define('gs-currency-format', GSCurrencyFormat);
        Object.seal(GSCurrencyFormat);
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Static class for handling generic configurable tag GS-ITEM
 */
class GSItem extends HTMLElement {

	static #dismiss = 'data-bs-dismiss';

	static #target = 'data-bs-target';

	static #toggle = 'data-bs-toggle';

	static #action = 'data-action';

	static #inject = 'data-inject';

	static #selectable = 'data-selectable';

	static #tags = ['GS-ITEM', 'TEMPLATE']

	static {
		customElements.define('gs-item', GSItem);
		Object.seal(GSItem);
	}

	constructor() {
		super();
		GSItem.validate(this);
	}

	static validate(own, tagName = 'GS-ITEM') {
		return GSDOM$1.validate(own, tagName, GSItem.#tags);
	}

	/**
	 * Return content of HTMLTemplate child element
	 * 
	 * @param {HTMLElement} el 
	 * @returns {string}
	 */
	static getBody(el, flat = false) {
		let tpl = GSItem.getTemplate(el);
		const isFlat = GSItem.getFlat(el);
		const anchor = GSItem.getAnchor(el);
		const acss = isFlat || flat ? `anchor="${anchor}" flat="true"` : '';
		const cls = GSAttr.get(el, 'css-template', '');
		if (tpl) return `<gs-template ${acss} href="${tpl}" class="${cls}"></gs-template>`;
		tpl = el.querySelector('template');
		return tpl?.innerHTML || '';
	}

	/**
	 * Get first level of generic gs-item element, used for configuring gs-* components
	 * @param {HTMLElement} root 
	 * @returns {Array<HTMLElement>} 
	 */
	static genericItems(root) {
		if (!GSDOM$1.isHTMLElement(root)) return [];
		return Array.from(root.children).filter(el => el.tagName == 'GS-ITEM')
	}

	/**
	 * Generate generic <gs-item>  tag from json object. Used by several GS Components
	 * Json format: array of json or json (child elemetns stored in item property
	 * Any property will be rendered as gs-item element attribute
	 * Example: [{title:"test2", message:"test2", items: [{title:"test2", message:"test2"}]}] 
	 * @param {*} val 
	 * @returns {string} generated html <gs-item...>
	 */
	static generateItem(val = '') {
		if (!GSUtil.isJsonType(val)) return '';
		if (!Array.isArray(val)) return GSItem.#generateItem(val);
		return GSItem.#generateItems(val);
	}

	static #numOrString(val) {
		return GSUtil.isNumber(val) || GSUtil.isStringNonEmpty(val);
	}

	static #generateItems(o) {
		return o.map(e => GSItem.#generateItem(e)).join('\n');
	}

	static #generateItem(o) {
		const args = GSItem.#generateArgs(o);
		const childs = Array.isArray(o.items) ? GSItem.generateItem(o.items) : '';
		return `<gs-item ${args}>${childs}</gs-item>`;
	}

	static #generateArgs(o) {
		return Object.entries(o).filter(kv => GSItem.#numOrString(kv[1]))
			.map(kv => `${kv[0]}="${kv[1]}"`).join(' ');
	}

	/**
	 * Hepler to joinf all base data-bs related attributes
	 * @param {*} el 
	 * @returns 
	 */
	static getAttrs(el) {
		return [GSItem.getDismissAttr(el), GSItem.getTargetAttr(el),
		GSItem.getToggleAttr(el), GSItem.getActionAttr(el),
		GSItem.getInjectAttr(el)].join(' ');
	}

	static getDismissAttr(el) {
		const v = GSItem.getDismiss(el);
		return v ? `${GSItem.#dismiss}="${v}"` : '';
	}

	static getTargetAttr(el) {
		const v = GSItem.getTarget(el);
		return v ? `${GSItem.#target}="${v}"` : '';
	}

	static getToggleAttr(el) {
		const v = GSItem.getToggle(el);
		return v ? `${GSItem.#toggle}="${v}"` : '';
	}

	static getActionAttr(el) {
		const v = GSItem.getAction(el);
		return v ? `${GSItem.#action}="${v}"` : '';
	}

	static getInjectAttr(el) {
		const v = GSItem.getInject(el);
		return v ? `${GSItem.#inject}="${v}"` : '';
	}

	static getSelectableAttr(el) {
		const v = GSItem.getSelectable(el);
		return v ? '' : `${GSItem.#selectable}="${v}"`;
	}

	static getActive(el) {
		return GSAttr.getAsBool(el, 'active');
	}

	static getAction(el) {
		return GSAttr.get(el, 'action');
	}

	static getDismiss(el) {
		return GSAttr.get(el, 'dismiss');
	}

	static getTarget(el) {
		return GSAttr.get(el, 'target');
	}

	static getToggle(el) {
		return GSAttr.get(el, 'toggle');
	}

	static getInject(el) {
		return GSAttr.get(el, 'inject');
	}

	static getIcon(el) {
		return GSAttr.get(el, 'icon');
	}

	static getSelectable(el) {
		return GSAttr.getAsBool(el, 'selectable', true);
	}

	static getAnchor(el) {
		return GSAttr.get(el, 'anchor', 'afterend@self');
	}

	static getFlat(el) {
		return GSAttr.getAsBool(el, 'flat', false);
	}

	static getName(el) {
		return GSAttr.get(el, 'name', '');
	}

	static getHref(el) {
		return GSAttr.get(el, 'href', '#');
	}

	static getCSS(el) {
		return GSAttr.get(el, 'css', '');
	}

	static getTemplate(el) {
		return GSAttr.get(el, 'template', '');
	}

	get dismissAttr() {
		return GSItem.getDismissAttr(this);
	}

	get targetAttr() {
		return GSItem.getTargetAttr(this);
	}

	get toggleAttr() {
		return GSItem.getToggleAttr(this);
	}

	get actionAttr() {
		return GSItem.getActionAttr(this);
	}

	get injectAttr() {
		return GSItem.getInjectAttr(this);
	}

	get action() {
		return GSItem.getAction(this);
	}

	get dismiss() {
		return GSItem.getDismiss(this);
	}

	get target() {
		return GSItem.getTarget(this);
	}

	get toggle() {
		return GSItem.getToggle(this);
	}

	get inject() {
		return GSItem.getInject(this);
	}

	get selectable() {
		return GSItem.getSelectable(this);
	}

	get flat() {
		return GSItem.getFlat(this);
	}

	get name() {
		return GSItem.getName(this);
	}

	get css() {
		return GSItem.getCSS(this);
	}

	get active() {
		return GSItem.getActive(this);
	}

	get template() {
		return GSItem.getTemplate(this);
	}

	get body() {
		return GSItem.getBody(el);
	}

	/**
	 * Convert JSON structure to DOM structure
	 * 
	 * const o = {....}
	 * document.body.innerHTML = GSItem.toDom(o);
	 * GSItem.toJson(document.body.firstElementChild);
	 * 
	 * @param {object} obj JSON Object to convert
	 * @param {string} tag DOM tag name
	 * @param {string} name DOM attribute name for object key
	 * @param {string} value DOM attribute name for object value
	 * @param {string} type DOM attribute name for object type
	 * @returns {string}
	 */
	static toDom(obj, tag = 'gs-item', name = 'name', value = 'value', type = 'type', child = false) {

		const tmp = [];

		if (!child) tmp.push('<gs-item type="object">');

		if (Array.isArray(obj)) {
			obj.forEach((o, i) => {

				const ptyp = typeof o;
				const isArray = Array.isArray(o);
				const isObj = !isArray && ptyp === 'object';

				if (isObj || isArray) {
					tmp.push(`<${tag} ${type}="object">`);
					tmp.push(GSItem.toDom(o, tag, name, value, type, true));
				} else {
					tmp.push(`<${tag} ${value}="${o}" ${type}="${ptyp}">`);
				}

				tmp.push(`</${tag}>`);


			});
		} else {
			Object.entries(obj).forEach(kv => {

				const pname = kv[0];
				const pobj = kv[1];
				const ptyp = typeof pobj;

				const isArray = Array.isArray(pobj);
				const isObj = !isArray && ptyp === 'object';
				let isSimple = false;

				if (isArray && pobj.length > 0) {
					const elIsArray = Array.isArray(pobj[0]);
					const elIsObj = typeof pobj[0] === 'object';
					isSimple = !(elIsArray || elIsObj);
				}

				if (isSimple) {
					tmp.push(`<${tag} ${name}="${pname}" ${type}="array">`);
					tmp.push(GSItem.toDom(pobj, tag, name, value, type, true));
				} else if (isArray) {
					tmp.push(`<${tag} ${name}="${pname}" ${type}="array">`);
					tmp.push(GSItem.toDom(pobj, tag, name, value, type, true));
				} else if (isObj) {
					tmp.push(`<${tag} ${name}="${pname}" ${type}="object">`);
					tmp.push(GSItem.toDom(pobj, tag, name, value, type, true));
				} else {
					tmp.push(`<${tag} ${name}="${pname}" ${value}="${pobj}" ${type}="${ptyp}">`);
				}

				tmp.push(`</${tag}>`);

			});
		}

		if (!child) tmp.push('</gs-item>');

		return tmp.join('');
	}

	/**
	 * Convert DOM tree into a JSON structure
	 * 
	 * const o = {....}
	 * document.body.innerHTML = GSItem.toDom(o);
	 * GSItem.toJson(document.body.firstElementChild);
	 * 
	 * @param {HTMLElement} obj HTML element instance to convert
	 * @param {string} name DOM attribute name for object key
	 * @param {string} value DOM attribute name for object value
	 * @param {string} type DOM attribute name for object type
	 * @returns {object}
	 */
	static toJson(el, name = 'name', value = 'value', type = 'type') {


		if (!(el instanceof HTMLElement)) return {};

		const nameV = el.getAttribute(name);
		const valV = el.getAttribute(value);
		const typeV = el.getAttribute(type);

		let obj = null;

		switch (typeV) {
			case 'array':
				obj = [];
				break;
			case 'object':
				obj = {};
				break;
			default:
				return GSItem.#toType(valV, typeV);
		}

		const childs = Array.from(el.children);
		const isArray = typeV === 'array';
		const isObject = typeV === 'object';

		childs.forEach(el => {
			const _nam = el.getAttribute(name);
			if (isArray) {
				obj.push(GSItem.toJson(el, name, value, type));
			} else if (isObject) {
				const tmp = GSItem.toJson(el, name, value, type);
				obj[_nam] = tmp;
			} else {
				const _val = el.getAttribute(value);
				const _typ = el.getAttribute(type);
				obj[nameV][_nam] = GSItem.#toType(_val, _typ);
			}
		});

		return obj;
	}

	static #toType(val, type) {
		switch (type) {
			case 'boolean': return val === 'true';
			case 'number': return parseFloat(val);
			default: return val
		}
	}
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * <gs-accordion css="" css-item="" css-header="" css-body="">
 *  <gs-item title="" message="" visible="false" autoclose="true" ></gs-item>
 * </gs-accordion>
 * @class
 * @extends {GSElement}
 */
class GSAccordion extends GSElement {

  static {
    customElements.define('gs-accordion', GSAccordion);
    Object.seal(GSAccordion);
  }

  static get observedAttributes() {
    const attrs = ['css', 'css-item', 'css-header', 'css-body', 'data'];
    return GSElement.observeAttributes(attrs);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {

    const me = this;

    if (name === 'data') return me.load(newValue);


    let css = null;

    switch (name) {
      case 'css':
        css = '.accordion';
        break;
      case 'css-item':
        css = '.accordion-item';
        break;
      case 'css-head':
        css = '.accordion-button';
        break;
      case 'css-body':
        css = '.accordion-collapse';
        break;
    }

    if (css) {
      me.queryAll(css).forEach(el => {
        GSDOM$1.toggleClass(el, oldValue, false);
        GSDOM$1.toggleClass(el, newValue, true);
      });
    }
  }

  async getTemplate(val = '') {
    const me = this;
    const id = GSID.id;
    const html = await me.#render(id);
    return `<div class="accordion ${me.css}" id="#${id}">${html}</div>`;
  }

  async #render(id) {
    const me = this;
    const list = GSItem.genericItems(me).map(el => me.#html(id, el));
    const html = await Promise.all(list);
    return html.join('');
  }

  get css() {
    return GSAttr.get(this, 'css', '');
  }

  set css(val = '') {
    GSAttr.set(this, 'css', val);
  }

  get cssItem() {
    return GSAttr.get(this, 'css-item', '');
  }

  set cssItem(val = '') {
    GSAttr.set(this, 'css-item', val);
  }

  get cssHead() {
    return GSAttr.get(this, 'css-head');
  }

  set cssHead(val = '') {
    return GSAttr.set(this, 'css-head', val);
  }

  get cssBody() {
    return GSAttr.get(this, 'css-body');
  }

  set cssBody(val = '') {
    return GSAttr.set(this, 'css-body', val);
  }

  async #html(id, el) {
    const me = this;
    const itemid = GSID.id;
    const tpl = GSItem.getBody(el);
    const title = me.#getTitle(el);
    const message = me.#getMessage(el);
    const autoclose = me.#getAutoclose(el) ? `data-bs-parent=#${id}` : '';
    const isVisible = me.#isVisible(el);
    return `
       <div class="accordion-item ${me.cssItem}">
         <slot name="content">
             <h2 class="accordion-header">
               <button class="accordion-button ${me.cssHead} ${isVisible ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${itemid}">
                 ${title}
               </button>
             </h2>
             <div class="accordion-collapse collapse ${me.cssBody} ${isVisible ? 'show' : ''}" id="${itemid}" ${autoclose}>
               <div class="accordion-body">
                   ${tpl || message}
               </div>
             </div>      
         </slot>
     </div>
     `
  }

  #getTitle(el) {
    return GSAttr.get(el, 'title');
  }

  #getMessage(el) {
    return GSAttr.get(el, 'message');
  }

  #isVisible(el) {
    return GSAttr.getAsBool(el, 'visible', false);
  }

  #getAutoclose(el) {
    return GSAttr.getAsBool(el, 'autoclose', true);
  }

  /**
   * Load data from various sources
   * 
   * @async
   * @param {JSON|func|url} val 
   * @returns {Promise}
   */
  async load(val = '') {
    const data = await GSLoader.loadData(val);
    if (!GSUtil.isJsonType(data)) return;
    const me = this;
    const src = GSItem.generateItem(data);
    GSDOM$1.setHTML(me, src);
    GSEvent.deattachListeners(me);
    me.connectedCallback();
    return data;
  }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * https://getbootstrap.com/docs/5.1/components/buttons/
 * Process Bootstrap alert definition
 * <gs-alert css="btn-primary" css-active="fade" message="focus hover" dismissable="true"></gs-alert>
 * @class
 * @extends {GSElement}
 */
class GSAlert extends GSElement {

    #dismissCSS = '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    #state = false;

    static {
        customElements.define('gs-alert', GSAlert);
        Object.seal(GSAlert);
    }

    static get observedAttributes() {
        const attrs = ['css', 'message', 'active'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
    }

    #onClick(e) {
        const me = this;
        GSEvent.send(me, 'action', { type: 'alert', source: e }, true);
        me.dismiss();
    }

    onReady() {
        const me = this;
        const btn = me.query('.btn-close');
        me.attachEvent(btn, 'click', me.#onClick.bind(me));
        super.onReady();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        const el = me.firstElementChild;

        if (name == 'message') GSDOM$1.setHTML(el, me.message);

        if (name == 'css') {
            GSDOM$1.toggleClass(el, oldValue, false);
            GSDOM$1.toggleClass(el, newValue, true);
        }

        if (name == 'active') GSDOM$1.toggleClass(el, activeCSS, !me.#state);
    }

    get template() {
        const me = this;
        return `
        <div class="alert ${me.css}" style="${this.getStyle()}" role="class">
            <slot>${me.message}</slot>
            ${me.dismissible ? me.#dismissCSS : ''}
        </class>`;
    }

    get css() {
        const tmp = this.dismissible ? 'alert-dismissible fade show' : '';
        return GSAttr.get(this, 'css') + ` ${tmp}`;
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get activeCSS() {
        return GSAttr.get(this, 'css-active', 'd-none');
    }

    set activeCSS(val = '') {
        return GSAttr.get(this, 'css-active', val);
    }

    get message() {
        return GSAttr.get(this, 'message');
    }

    set message(val = '') {
        return GSAttr.set(this, 'message', val);
    }

    get dismissible() {
        return GSAttr.getAsBool(this, 'dismissible', false);
    }

    set dismissible(val = '') {
        return GSAttr.set(this, 'dismissible', GSUtil.asBool(val));
    }

    async #dismiss() {
        const me = this;
        GSDOM$1.toggleClass(me.query('.alert'), 'show', false);
        await GSUtil.timeout(GSDOM$1.SPEED);
        return me.remove();
    }

    dismiss() {
        return this.#dismiss();
    }

    toggle() {
        this.active = !this.active;
    }

    /**
     * Prevent shadow dom
     */
    get isFlat() {
        return GSAttr.getAsBool(this, 'flat', true);
    }

    get anchor() {
        return 'self';
    }

}

/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * https://getbootstrap.com/docs/5.1/components/buttons/
 * Process Bootstrap button definition
 * <gs-button css="btn-primary" title="focus hover" toggle="offcanvas|collapse|dropdown|button|tab|pill|popover|tooltip|modal" dismiss="offcanvas|modal|alert" target="css selector"></gs-button>
 * @class
 * @extends {GSElement}
 */
class GSButton extends GSElement {


    #state = false;

    static {
        customElements.define('gs-button', GSButton);
        Object.seal(GSButton);
    }

    static get observedAttributes() {
        const attrs = ['css', 'dismiss', 'target', 'toggle', 'title', 'active', 'disable'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
    }

    #onClick(e) {
        const me = this;
        if (me.disable) return false;
        GSEvent.send(me, 'action', { type: 'button', action: me.action, source: e }, true, true, true);
        if (me.active) {
            me.#state = !me.#state;
            GSDOM$1.toggleClass(me.firstElementChild, 'active', me.#state);
        }
        if (!me.select) me.#button?.blur();
    }

    onReady() {
        const me = this;
        me.attachEvent(me.#button, 'click', me.#onClick.bind(me));
        super.onReady();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        const el = me.firstElementChild;
        me.#update(name, oldValue, newValue);
        GSAttr.set(el, `data-bs-${name}`, newValue);
    }

    get #button() {
        return this.query('button');
    }

    #update(name = '', oldValue = '', newValue = '') {

        const me = this;
        const el = me.firstElementChild;

        if (name == 'title') return GSDOM$1.setHTML(el, me.title);

        if (name == 'css') {
            GSDOM$1.toggleClass(el, oldValue, false);
            GSDOM$1.toggleClass(el, newValue, true);
        }

        if (name == 'active') return GSDOM$1.toggleClass(el, 'active', me.#state);
        if (name == 'disable') return GSAttr.set(me.firstElementChild, 'disabled', GSUtil.asBool(newValue) ? newValue : null);
    }

    get template() {
        const me = this;
        const disabled = me.disable ? 'disabled' : '';
        const icon = me.icon ? `<i class="${me.icon}"></i>` : '';
        // const content = me.rtl ? `${me.title} ${icon}` : `${icon} ${me.title}`;
        const content = `${icon} ${me.title}`;
        const action = GSItem.getActionAttr(me);
        const dissmis = GSItem.getDismissAttr(me);
        const target = GSItem.getTargetAttr(me);
        const toggle = GSItem.getToggleAttr(me);
        return `<button type="${me.type}" class="btn ${me.css}" ${action} ${toggle} ${target} ${dissmis} ${disabled} title="${me.comment}" role="tooltip">${content}</button>`;
    }

    get css() {
        const active = this.#state ? 'active' : '';
        return GSAttr.get(this, 'css') + ` ${active}`;
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get action() {
        return GSAttr.get(this, 'action');
    }

    set action(val = '') {
        return GSAttr.set(this, 'action', val);
    }

    get dismiss() {
        return GSAttr.get(this, 'dismiss');
    }

    set dismiss(val = '') {
        return GSAttr.set(this, 'dismiss', val);
    }

    get icon() {
        return GSAttr.get(this, 'icon');
    }

    set icon(val = '') {
        return GSAttr.set(this, 'icon', val);
    }

    get target() {
        return GSAttr.get(this, 'target');
    }

    set target(val = '') {
        return GSAttr.set(this, 'target', val);
    }

    get toggle() {
        return GSAttr.get(this, 'toggle');
    }

    set toggle(val = '') {
        return GSAttr.set(this, 'toggle', val);
    }

    get comment() {
        return GSAttr.get(this, 'comment');
    }

    set comment(val = '') {
        return GSAttr.set(this, 'comment', val);
    }

    get title() {
        return GSAttr.get(this, 'title');
    }

    set title(val = '') {
        return GSAttr.set(this, 'title', val);
    }

    get active() {
        return GSAttr.getAsBool(this, 'active', false);
    }

    set active(val = '') {
        this.#state = GSUtil.asBool(val);
        return GSAttr.set(this, 'active', this.#state);
    }

    get disable() {
        return GSAttr.getAsBool(this, 'disable', false);
    }

    set disable(val = '') {
        return GSAttr.getAsBool(this, 'disable', val);
    }

    get select() {
        return GSAttr.getAsBool(this, 'select', true);
    }

    set select(val = '') {
        return GSAttr.setAsBool(this, 'select', val);
    }

    get type() {
        return GSAttr.get(this, 'type', 'button');
    }

    set type(val = '') {
        return GSAttr.set(this, 'type', val);
    }

    toggle() {
        this.active = !this.active;
    }

    /**
     * Prevent shadow dom
     */
    get isFlat() {
        return true;
    }

    get anchor() {
        return 'self';
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Center inside browser
 * @class
 * @extends {GSElement}
 */
class GSCenter extends GSElement {

   static {
      customElements.define('gs-center', GSCenter);
      Object.seal(GSCenter);
   }

   static get observedAttributes() {
      const attrs = ['css'];
      return GSElement.observeAttributes(attrs);
   }

   attributeCallback(name = '', oldValue = '', newValue = '') {
      const me = this;
      if (name === 'css') {
         const el = me.query('div');
         GSDOM$1.toggleClass(el, oldValue, false);
         GSDOM$1.toggleClass(el, newValue, true);
      }
   }

   async getTemplate() {
      return `<div class="position-absolute top-50 start-50 translate-middle ${this.css}" style="${this.getStyle()}"><slot></slot></div>`;
   }

   get css() {
      return GSAttr.get(this, 'css', '');
   }

   set css(val = '') {
      return GSAttr.set(this, 'css', vel);
   }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Context menu
 *
 * @class
 * @extends {GSElement}
 */
class GSContext extends GSElement {

  // element that opened context
  #caller = null;

  #online = false;
  #ready = false;
  #attached = false;

  static {
    customElements.define('gs-context', GSContext);
    Object.seal(GSContext);
  }

  static get observedAttributes() {
    const attrs = ['visible', 'title', 'css', 'data'];
    return GSElement.observeAttributes(attrs);
  }

  constructor() {
    super();
    GSItem.validate(this, this.tagName);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;

    if (name === 'data') return this.load(newValue);

    if (name === 'visible') {
      me.#submenus.forEach(el => el.classList.remove('show'));
      const menu = me.#menu;
      if (menu) GSDOM$1.toggleClass(menu, 'show', me.visible);
    }
  }

  async getTemplate(val = '') {
    const me = this;
    if (!val && me.childElementCount > 0) return me.#renderMenuDOM();
    return super.getTemplate(val);
  }

  connectedCallback() {
    super.connectedCallback();
    const me = this;
    me.#online = true;
  }

  disconnectedCallback() {
    const me = this;
    me.#online = false;
    super.disconnectedCallback();
  }

  onReady() {
    const me = this;
    if (me.#ready) return;
    me.#ready = true;
    me.close();
    me.attachEvent(document, 'gs-component', me.#attachTarget.bind(me));
    me.attachEvent(me.#menu, 'mouseleave', me.close.bind(me));
    me.attachEvent(window, 'resize', me.#onResize.bind(me));
    me.#attachSubmenu();
    me.#attachOptions();
    me.#attachTarget();
    super.onReady();
  }

  reattach() {
    const me = this;
    me.#attached = false;
    me.removeEvent(document, 'contextmenu');
    GSDOM$1.queryAll(document.documentElement, me.target).forEach(target => me.removeEvent(target, 'contextmenu'));
    me.#attachTarget();
  }

  get isFlat() {
    return this.parentElement !== document.body;
  }

  /**
   * NOTE: Fixed positioning must be rendered in body element 
   * to prevent css translate coordinates.
   */
  get anchor() {
    return 'beforeend@body';
  }

  get visible() {
    return GSAttr.getAsBool(this, 'visible');
  }

  set visible(val = '') {
    return GSAttr.setAsBool(this, 'visible', val);
  }

  get disabled() {
    return GSAttr.getAsBool(this, 'disabled');
  }

  set disabled(val = '') {
    return GSAttr.setAsBool(this, 'disabled', val);
  }

  get dark() {
    return GSAttr.getAsBool(this, 'dark');
  }

  get target() {
    return GSAttr.get(this, 'target');
  }

  close(e) {
    if (e instanceof Event) e.preventDefault();
    this.visible = false;
  }

  open() {
    this.visible = true;
  }

  toggle() {
    this.visible = !this.visible;
  }

  /**
   * Show submenu at x/y position on the screen
   * @param {number} x 
   * @param {number} y 
   * @returns {void}
   */
  popup(x = 0, y = 0) {
    const me = this;
    if (me.disabled) return;
    const menu = me.#menu;
    if (!menu) return;
    requestAnimationFrame(() => {
      menu.style.position = 'fixed';
      menu.style.top = '0px';
      menu.style.left = '0px';
      menu.style.transform = `translate(${x}px, ${y}px)`;
      me.visible = true;
    });

  }

  /**
   * Create menu from JSON object
   * [{name:'', action:'', menu: []}]
   * @param {*} items 
   * @returns {boolean}
   */
  createMenu(items = []) {
    if (!Array.isArray(items)) return false;
    if (items.length === 0) return false;
    const me = this;
    const opts = me.#renderMenu(items);
    GSDOM$1.setHTML(me.#menu, opts.join(''));
    me.#attachOptions();
    me.#attachSubmenu();
    return true;
  }

  #renderMenu(items = []) {
    const me = this;
    const dark = me.dark ? 'dropdown-menu-dark' : '';
    const opts = [];
    items.forEach(it => {
      if (it === '-') return opts.push('<li><hr class="dropdown-divider"/></li>');
      const hasSubmenu = Array.isArray(it.menu);
      opts.push('<li>');
      opts.push(`<a class="dropdown-item" href="#"`);
      if (it.action) opts.push(` data-action="${it.action}"`);
      opts.push(`>${it.name} ${hasSubmenu ? '&raquo;' : ''}</a>`);
      if (hasSubmenu) {
        const sub = me.#renderMenu(it.menu);
        opts.push(`<ul class="submenu dropdown-menu ${dark}">`);
        opts.push(sub.join('\n'));
        opts.push('</ul>');
      }
      opts.push('</li>');

    });
    return opts;
  }

  get #menu() {
    return this.query('.dropdown-menu');
  }

  get #items() {
    return this.queryAll('.dropdown-item', true);
  }

  get #submenus() {
    return this.queryAll('.submenu', true);
  }

  #onResize(e) {
    this.close();
  }

  #onPopup(e) {
    GSEvent.prevent(e);
    const me = this;
    me.#caller = e.target;
    const rect = me.#menu?.getBoundingClientRect();
    if (!rect) return;
    let x = e.clientX, y = e.clientY;
    const overflowH = x + rect.width > window.innerWidth;
    const overflowV = y + rect.height > window.innerHeight;
    if (overflowH) x = window.innerWidth - rect.width;
    if (overflowV) y = window.innerHeight - rect.height;
    me.#updateSubmenus(overflowV, overflowH);
    me.popup(x, y);
    return true;
  }

  #updateSubmenus(overflowV = false, overflowH = false) {
    const me = this;
    requestAnimationFrame(() => {
      me.#submenus.forEach(el => {
        el.style.position = 'absolute';
        el.style.left = 'inherit';
        el.style.right = 'inherit';
        el.style.top = 'inherit';
        if (overflowH) {
          el.style.right = '100%';
        } else {
          el.style.left = '100%';
        }
      });
    });
  }

  /**
   * Add click events to menu options
   */
  #attachOptions() {
    const me = this;
    me.#items.filter(btn => btn.dataset.action)
      .forEach(btn => me.attachEvent(btn, 'click', me.#onClick.bind(me)));
  }

  #onClick(e) {
    const me = this;
    e.preventDefault();
    me.close();
    const data = e.target.dataset;
    const opt = { type: 'contextmenu', option: e.target, caller: me.#caller, data: data };
    GSEvent.send(me, 'action', opt, true, true, true); // notify self
  }

  /**
   * Show proper submenu on mouse over
   * @param {Event} e 
   * @returns {void}
   */
  #onSubmenu(e) {
    const li = e.target.parentElement;
    const ul = li.parentElement;
    const sub = GSDOM$1.query(li, '.submenu');
    requestAnimationFrame(() => {
      GSDOM$1.queryAll(ul, '.submenu')
        .forEach(el => el.classList.remove('show'));
      if (sub) {
        sub.style.top = `${sub.parentElement.offsetTop}px`;
        sub.classList.add('show');
      }
    });
  }

  /**
   * Attach mouseover for menu items that showa/hides submenu
   */
  #attachSubmenu() {
    const me = this;
    me.#items.forEach(el => me.attachEvent(el, 'mouseover', me.#onSubmenu.bind(me)));
  }

  /**
   * Attach context menu to target
   * 
   * @async
   * @returns {Promise}
   */
  async #attachTarget() {
    const me = this;
    if (!me.target) return;
    if (me.#attached) return;
    const targets = GSDOM$1.queryAll(document.documentElement, me.target);
    if (targets.length === 0) {
      if (me.#online) {
        await GSUtil.timeout(1000);
        requestAnimationFrame(() => {
          me.#attachTarget();
        });
      }
      return;
    }
    me.#attached = true;
    targets.forEach(target => me.attachEvent(target, 'contextmenu', me.#onPopup.bind(me)));
    me.removeEvent(document, 'gs-components');
    me.attachEvent(document, 'contextmenu', me.close.bind(me));
  }

  #renderMenuDOM(children, level = 0) {
    const me = this;
    children = children || me.children;
    const list = [];

    const sub = level === 0 ? 'position-fixed' : 'submenu';

    list.push(`<ul class="${sub} dropdown-menu ${me.dark ? 'dropdown-menu-dark' : ''}">`);

    Array.from(children).forEach(el => {
      const isSub = el.childElementCount > 0;
      if (isSub) list.push(me.#renderSub(el));
      const html = isSub ? me.#renderMenuDOM(el.children, ++level) : me.#renderChild(el);
      list.push(html);
      if (sub) list.push(`</li>`);
    });

    list.push('</ul>');
    return list.join('');
  }

  #renderSub(el) {
    const name = GSAttr.get(el, 'name');
    return `<li><a class="dropdown-item" href="#">${name} &raquo; </a>`;
  }

  #renderChild(el) {
    const name = GSAttr.get(el, 'name');
    const action = GSAttr.get(el, 'action');
    const header = GSAttr.get(el, 'header');
    if (header) return `<li><h6 class="dropdown-header"/>${header}</h6></li>`;
    if (!name) return `<li><hr class="dropdown-divider"/></li>`;
    if (!action) return ``;
    return `<li><a class="dropdown-item" href="#" data-action="${action}">${name}</a></li>`;
  }

  /**
   * Load data from various sources
   * Json format: array of json or json (child elemetns stored in item property
   * Any property will be rendered as gs-item element attribute
   * Example: [{title:"test2", message:"test2", items: [{title:"test2", message:"test2"}]}]
   * 
   * @async
   * @param {JSON|func|url} val 
   * @returns {Promise}
   */
  async load(val = '') {
    const data = await GSLoader.loadData(val);
    if (!GSUtil.isJsonType(data)) return;
    const me = this;
    const src = GSItem.generateItem(data);
    GSDOM$1.setHTML(me, src);
    GSEvent.deattachListeners(me);
    me.connectedCallback();
    return data;
  }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Native dialog with Bootstrap support
 * @class
 * @extends {GSElement}
 */
class GSDialog extends GSElement {

  static CSS = 'rounded shadow-sm';
  static HEADER_CSS = 'p-3';
  static TITLE_CSS = 'fs-5 fw-bold text-muted';

  static #actions = ['ok', 'cancel'];

  static {
    customElements.define('gs-dialog', GSDialog);
    Object.seal(GSDialog);
  }

  static get observedAttributes() {
    const attrs = ['cancelable', 'closable', 'title', 'visible'];
    return GSElement.observeAttributes(attrs);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    me.#update();
    if (name === 'visible') {
      if (me.visible) {
        if (!me.#dialog.open) me.#dialog.showModal();
        me.focusable()?.focus();
      } else {
        me.#dialog.close();
      }
      GSEvent.send(me, 'visible', { type: 'dialog', ok: me.visible }, true, true);
    }
  }

  onReady() {
    const me = this;
    me.attachEvent(me, 'click', me.#onClick.bind(me));
    me.attachEvent(me, 'action', me.#onClick.bind(me));
    me.attachEvent(me, 'form', me.#onForm.bind(me));
    me.attachEvent(me.#dialog, 'keydown', me.#onEscape.bind(me));
    super.onReady();
    if (me.visible) me.open();
  }

  #onForm(e) {
    const me = this;
    GSEvent.prevent(e);
    const sts = GSEvent.send(me, 'data', { type: 'dialog', data: e.detail.data, evt: e }, true, true, true);
    if (sts) me.close();
  }

  #onEscape(e) {
    const me = this;
    if (!me.cancelable && e.key === 'Escape') return GSEvent.prevent(e);
  }

  #onClick(e) {

    const me = this;
    const action = me.#isAcceptedAction(e);
    if (!action) return;

    const isOk = action === 'ok';
    const forms = GSDOM$1.queryAll(me, 'form');
    const processForms = isOk && forms.length > 0;

    if (processForms) {
      const invalid = forms.filter(form => form.checkValidity() == false);
      invalid.forEach(form => me.#reportForm(form));
      if (invalid.length === 0) forms.forEach(form => me.#submitForm(form));

      const els = invalid.map(form => GSDOM$1.queryAll(form, 'textarea, input, select').filter(el => el.checkValidity() == false));
      if (els.length > 0) GSEvent.send(me, 'error', { type: 'dialog', data: els }, true, true, true);
      return;
    }

    let sts = true;
    try {
      sts = GSEvent.send(me, 'action', { type: 'dialog', ok: isOk, evt: e }, true, true, true);
    } finally {
      if (sts) me.close(null, isOk);
    }
  }

  #submitForm(form) {
    try {
      GSEvent.send(form, 'action', { action: 'submit' });
    } catch (e) {
      console.log(e);
    }
  }

  #reportForm(form) {
    try {
      form.reportValidity();
    } catch (e) {
      console.log(e);
    }
  }

  #getAction(e) {
    const el = e.composedPath().shift();
    return el?.dataset?.action || e.detail.action || el?.type;
  }

  #isAcceptedAction(e) {
    const action = this.#getAction(e);
    const isOk = GSDialog.#actions.includes(action);
    if (isOk) GSEvent.prevent(e);
    return isOk ? action : null;
  }

  /**
   * Generic modal popup function
   * @param {string} title Modal title
   * @param {string} message Modal message 
   * @param {boolean} closable Can user close it (close button)
   * @param {boolean} cancelable Is cancel button available
   * @returns {Promise}
   */
  info(title = '', message = '', closable = false, cancelable = false) {
    const me = this;
    me.title = title;
    me.body = message;
    me.cancelable = cancelable;
    me.closable = closable;
    me.open();
    if (closable || cancelable) return me.waitEvent('action');
  }

  confirm(title = '', message = '') {
    const me = this;
    return me.info(title, message, true, false);
  }

  prompt(title = '', message = '') {
    const me = this;
    return me.info(title, message, true, true);
  }

  /**
   * Show modal panel
   */
  open(e) {
    GSEvent.prevent(e);
    const me = this;
    const sts = GSEvent.send(me, 'open', { type: 'dialog' }, true, true, true);
    if (sts) me.visible = true;
  }

  /**
   * Hide modal panel
   */
  close(e, ok = false) {
    GSEvent.prevent(e);
    const me = this;
    const sts = GSEvent.send(me, 'close', { type: 'dialog', isOk: ok }, true, true, true);
    if (sts) me.visible = false;
  }

  /**
   * Toggle modal panel
   */
  toggle() {
    const me = this;
    me.visible = !me.visible;
  }

  /**
   * Return active button
   * @returns {HTMLButtonElement|GSButton}
   */
  focusable() {
    const me = this;
    if (me.cancelable) return me.#buttonCancelEl;
    if (me.closable) return me.#buttonOkEl;
    return me;
  }

  get #buttonOkEl() {
    return this.query('.dialog-ok');
  }

  get #buttonCancelEl() {
    return this.query('.dialog-cancel');
  }

  #update() {
    const me = this;
    GSDOM$1.toggle(me.#buttonOkEl, !me.closable);
    GSDOM$1.toggle(me.#buttonCancelEl, !me.cancelable);
    const css = `justify-content-${me.align}`;
    const footer = me.query('.card-footer');
    GSDOM$1.toggleClass(footer, css, true);
  }

  /**
   * Search for named slot tag or css selector 
   * @param {string} name Tagged slot  name
   * @param {*} qry CSS selector
   * @returns {HTMLElement|Array<HTMLElement>}
   */
  #findSlotOrEl(name = '', qry = '') {
    const me = this;
    let el = name ? me.self.querySelector(`slot[name="${name}"]`) : null;
    if (!el) el = me.self.querySelector(qry);
    return el;
  }

  /**
   * N/A - compatibiltiy with gs-modal
   */
  large() {

  }

  /**
   * N/A - compatibiltiy with gs-modal
   */  
  extra() {
    
  }

  get #dialog() {
    return this.query('dialog');
  }

  get title() {
    //return this.#findSlotOrEl('title', '.card-title');
    return this.query('.card-title');
  }

  set title(val = '') {
    GSDOM$1.setHTML(this.title, val);
  }

  get body() {
    //return this.#findSlotOrEl('body', '.card-body');
    return this.query('.card-body');
  }

  set body(val = '') {
    GSDOM$1.setHTML(this.body, val);
  }

  get visible() {
    return GSAttr.getAsBool(this, 'visible', false);
  }

  set visible(val = false) {
    GSAttr.setAsBool(this, 'visible', val);
  }

  get closable() {
    return GSAttr.getAsBool(this, 'closable', true);
  }

  set closable(val = true) {
    GSAttr.setAsBool(this, 'closable', val);
    this.#update();
  }

  get cancelable() {
    return GSAttr.getAsBool(this, 'cancelable', true);
  }

  set cancelable(val = true) {
    GSAttr.setAsBool(this, 'cancelable', val);
    this.#update();
  }

  /**
   * Align buttons start | end | center
   */
  get align() {
    return GSAttr.get(this, 'button-align', 'end');
  }

  set align(val = 'end') {
    GSAttr.set(this, 'button-align', val);
    this.#update();
  }

  get buttonOk() {
    return GSAttr.get(this, "button-ok", "Ok");
  }

  set buttonOk(val = 'Ok') {
    GSAttr.set(this, "button-ok", val);
  }

  get buttonCancel() {
    return GSAttr.get(this, "button-cancel", "Cancel");
  }

  set buttonCancel(val = 'Cancel') {
    GSAttr.set(this, "button-cancel", val);
  }

  get cssButtonOk() {
    return GSAttr.get(this, "css-button-ok", "btn-primary");
  }

  get cssButtonCancel() {
    return GSAttr.get(this, "css-button-cancel", "btn-secondary");
  }

  get css() {
    return GSAttr.get(this, "css", GSDialog.CSS);
  }

  get cssContent() {
    return GSAttr.get(this, "css-content", "");
  }

  get cssHeader() {
    return GSAttr.get(this, "css-header", GSDialog.HEADER_CSS);
  }

  get cssTitle() {
    return GSAttr.get(this, "css-title", GSDialog.TITLE_CSS);
  }

  get cssBody() {
    return GSAttr.get(this, "css-body", "p-0");
  }

  get cssFooter() {
    return GSAttr.get(this, "css-footer", "");
  }

  set css(val = '') {
    return GSAttr.set(this, "css", val);
  }

  set cssContent(val = '') {
    return GSAttr.set(this, "css-content", val);
  }

  set cssHeader(val = '') {
    return GSAttr.set(this, "css-header", val);
  }

  set cssTitle(val = '') {
    return GSAttr.set(this, "css-title", val);
  }

  set cssBody(val = '') {
    return GSAttr.set(this, "css-body", val);
  }

  set cssFooter(val = '') {
    return GSAttr.set(this, "css-footer", val);
  }

  // css, css-content css-header css-title css-body css-footer
  async getTemplate(val = '') {
    if (val) return super.getTemplate(val);
    const me = this;
    return `
        <dialog class="p-0 border-0 ${me.css}">
        <div class="card">
            <div class="card-header user-select-none ${me.cssHeader}">
              <div class="card-title ${me.cssTitle}">
                <slot name="title"></slot>
              </div>
            </div>
            <div class="card-body ${me.cssBody}">
              <slot name="body"></slot>
            </div>
            <div class="card-footer d-flex user-select-none justify-content-${me.align} ${me.cssFooter}">
              <button class="btn ${me.cssButtonCancel} dialog-cancel" data-action="cancel">${me.buttonCancel}</button>
              &nbsp;
              <button class="btn ${me.cssButtonOk} dialog-ok" data-action="ok">${me.buttonOk}</button>
            </div>
        </div>
        </dialog>
     `
  }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Dropdown menu
 * @class
 * @extends {GSElement}
 */
class GSDropdown extends GSElement {

  #ready = false;

  static {
    customElements.define('gs-dropdown', GSDropdown);
    Object.seal(GSDropdown);
  }

  static get observedAttributes() {
    const attrs = ['visible', 'title', 'css', 'data'];
    return GSElement.observeAttributes(attrs);
  }

  constructor() {
    super();
    GSItem.validate(this, this.tagName);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {

    const me = this;

    if (name === 'data') return this.load(newValue);

    if (name === 'visible') {
      me.#submenus.forEach(el => el.classList.remove('show'));
      const menu = me.#menu;
      if (!menu) return;
      GSDOM$1.toggleClass(menu, 'show', me.visible);
      requestAnimationFrame(() => {
        if (me.visible) {
          me.#updatePos(menu);
        } else {
          menu.style.left = '';
          menu.style.top = '';
        }
      });

    }

    if (name === 'css') {
      GSDOM$1.toggleClass(me.#button, oldValue, false);
      GSDOM$1.toggleClass(me.#button, newValue, true);
    }

    if (name === 'title' && me.#button) {
      GSDOM$1.setHTML(me.#button, newValue);
    }
  }

  #updatePos(el) {

    const style = window.getComputedStyle(el);

    const w = parseInt(style.width, 10);
    const l = parseInt(style.left, 10);
    const ww = parseInt(window.innerWidth, 10);

    const t = parseInt(style.top, 10);
    const h = parseInt(style.height, 10);
    const wh = parseInt(window.innerHeight, 10);

    if (l + w > ww) el.style.left = `${l - ((l + w) - ww)}px`;
    if (t + h > wh) el.style.top = `${t - ((t + h) - wh)}px`;
  }

  #updateSub(sub) {
    const me = this;
    const menu = me.#menu;

    const ww = parseInt(window.innerWidth, 10);

    const menustyle = window.getComputedStyle(menu);
    const substyle = window.getComputedStyle(sub);

    const ml = parseInt(menustyle.left, 10);
    const mw = parseInt(menustyle.width, 10);
    parseInt(menustyle.top, 10);
    parseInt(menustyle.height, 10);

    const sl = parseInt(substyle.left, 10);
    const sw = parseInt(substyle.width, 10);

    parseInt(substyle.top, 10);
    parseInt(substyle.height, 10);

    if (sl + sw + ml + mw > ww) sub.style.left = `-${sw}px`;
    // if (st + sh + mt + mh > wh) sub.style.top = `${wh - ((st+sh) - wh)}px`;

  }

  async getTemplate(val = '') {
    const me = this;
    if (!val && me.childElementCount > 0) return me.#renderMenuDOM();
    return super.getTemplate(val);
  }

  onReady() {
    const me = this;
    if (me.#ready) return;
    me.#ready = true;
    me.close();
    me.attachEvent(me.#menu, 'mouseleave', me.close.bind(me));
    me.#attachSubmenu();
    me.#attachItems();
    me.#updateSubmenus();
    super.onReady();
  }

  get css() {
    return GSAttr.get(this, 'css');
  }

  set css(val = '') {
    return GSAttr.set(this, 'css', val);
  }

  get title() {
    return GSAttr.get(this, 'title');
  }

  set title(val = '') {
    return GSAttr.set(this, 'title', val);
  }

  get visible() {
    return GSAttr.getAsBool(this, 'visible');
  }

  set visible(val = '') {
    return GSAttr.setAsBool(this, 'visible', val);
  }

  get dark() {
    return GSAttr.getAsBool(this, 'dark');
  }

  get isFlat() {
    const me = this;
    return GSAttr.getAsBool(me, 'flat', me.title ? false : true);
  }

  get anchor() {
    return 'afterend@self';
  }

  close() {
    this.visible = false;
  }

  open() {
    this.visible = true;
  }

  toggle() {
    this.visible = !this.visible;
  }

  /**
   * Create menu from JSON object
   * [{name:'', action:'', menu: []}]
   * @param {Array<object>} items 
   * @returns {boolean} Status true if creation is ok
   */
  createMenu(items = []) {
    if (!Array.isArray(items)) return false;
    if (items.length === 0) return false;
    const me = this;
    const opts = me.#renderMenu(items);
    GSDOM$1.setHTML(me.#menu, opts.join(''));
    me.#attachItems();
    me.#attachSubmenu();
    return true;
  }

  #renderMenu(items = []) {
    const me = this;
    const dark = me.dark ? 'dropdown-menu-dark' : '';
    const opts = [];
    items.forEach(it => {
      if (it === '-') return opts.push('<li><hr class="dropdown-divider"/></li>');
      const hasSubmenu = Array.isArray(it.menu);
      opts.push('<li>');
      opts.push(`<a class="dropdown-item" href="#" `);
      opts.push(GSItem.getAttrs(el));
      /*
      if (it.action) opts.push(` data-action="${it.action}"`);
      if (it.inject) opts.push(` data-inject="${it.inject}"`);
      if (it.target) opts.push(` data-bs-target="${it.target}"`);
      */
      opts.push('>');

      if (me.rtl) ;
      opts.push(`${it.name} ${hasSubmenu ? '&raquo;' : ''}`);

      opts.push('</a>');

      if (hasSubmenu) {
        const sub = me.#renderMenu(it.menu);
        opts.push(`<ul class="submenu dropdown-menu ${dark}">`);
        opts.push(sub.join('\n'));
        opts.push('</ul>');
      }
      opts.push('</li>');

    });
    return opts;
  }

  get #menu() {
    return this.query('.dropdown-menu');
  }

  get #button() {
    return this.query('.dropdown-toggle');
  }

  get #items() {
    return this.queryAll('.dropdown-item');
  }

  get #submenus() {
    return this.queryAll('.submenu');
  }

  /**
   * Add click events to menu options
   */
  #attachItems() {
    const me = this;
    me.#items.filter(btn => btn.dataset.action)
      .forEach(btn => me.attachEvent(btn, 'click', me.#onClick.bind(me)));
  }

  #onClick(e) {
    const me = this;
    e.preventDefault();
    me.close();
    const opt = { type: 'dropdown', source: e };
    GSEvent.send(me, 'action', opt, true); // notify self
  }

  /**
   * Show proper submenu on mouse over
   * @param {Event} e 
   * @returns {void}
   */
  #onSubmenu(e) {
    const me = this;
    const li = e.target.closest('li');
    const ul = li.closest('ul');
    const sub = GSDOM$1.query(li, '.submenu');
    requestAnimationFrame(() => {
      GSDOM$1.queryAll(ul, '.submenu')
        .forEach(el => el.classList.remove('show'));
      if (sub) {
        const val = li.offsetTop;
        sub.style.top = `${val}px`;
        sub.classList.add('show');
        me.#updateSub(sub);
      }
    });
  }

  #updateSubmenus(overflowV = false, overflowH = false) {
    const me = this;
    me.#submenus.forEach(el => {
      el.style.position = 'absolute';
      el.style.left = 'inherit';
      el.style.right = 'inherit';
      el.style.top = 'inherit';
      if (overflowH) {
        el.style.right = '100%';
      } else {
        el.style.left = '100%';
      }
    });
  }

  /**
   * Attach mouseover for menu items that showa/hides submenu
   */
  #attachSubmenu() {
    const me = this;
    me.#items.forEach(el => me.attachEvent(el, 'mouseover', me.#onSubmenu.bind(me)));
  }

  #renderMenuDOM(children, level = 0) {
    const me = this;
    children = children || me.children;
    const list = [];

    const sub = level === 0 ? '' : 'submenu';

    if (level === 0 && me.title) {
      list.push('<div class="dropdown">');
      list.push(`<button class="btn dropdown-toggle ${me.css}" type="button" data-bs-toggle="dropdown">`);
      list.push(me.title);
      list.push('</button>');
    }

    list.push(`<ul class="${sub} dropdown-menu ${me.dark ? 'dropdown-menu-dark' : ''}">`);

    Array.from(children).forEach(el => {
      const isSub = el.childElementCount > 0;
      if (isSub) list.push(me.#renderSub(el));
      const html = isSub ? me.#renderMenuDOM(el.children, ++level) : me.#renderChild(el);
      list.push(html);
      if (sub) list.push(`</li>`);
    });

    list.push('</ul>');
    if (level === 0 && me.title) list.push('</div>');
    return list.join('');
  }

  #renderSub(el) {
    const name = GSAttr.get(el, 'name');
    return `<li><a class="dropdown-item" href="#">${name} &raquo; </a>`;
  }

  #renderChild(el) {
    const name = GSAttr.get(el, 'name');
    const header = GSAttr.get(el, 'header');
    if (header) return `<li><h6 class="dropdown-header"/>${header}</h6></li>`;
    if (!name) return `<li><hr class="dropdown-divider"/></li>`;
    const attrs = GSItem.getAttrs(el).trim();
    return attrs ? `<li><a class="dropdown-item" href="#" ${attrs} >${name}</a></li>` : '';
  }

  /**
   * Load data from various sources
   * Json format: array of json or json (child elemetns stored in item property
   * Any property will be rendered as gs-item element attribute
   * Example: [{title:"test2", message:"test2", items: [{title:"test2", message:"test2"}]}]
   * 
   * @async
   * @param {JSON|func|url} val 
   * @returns {Promise}
   */
  async load(val = '') {
    const data = await GSLoader.loadData(val);
    if (!GSUtil.isJsonType(data)) return;
    const me = this;
    const src = GSItem.generateItem(data);
    GSDOM$1.setHTML(me, src);
    GSEvent.deattachListeners(me);
    me.connectedCallback();
    return data;
  }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Center inside browser
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#list
 * @class
 * @extends {GSElement}
 */
class GSFormGroup extends GSElement {

   static CSS_LABEL_CELL = 'col-md-4 col-sm-4 col-xs2 text-md-end';
   static CSS_LABEL = 'user-select-none fw-small fw-light text-secondary';
   static CSS_ICON = 'bi bi-info-circle-fill text-primary me-2 fs-5';

   static {
      customElements.define('gs-form-group', GSFormGroup);
      Object.seal(GSFormGroup);
   }

   constructor() {
      super();
      this.#validateAllowed();
  }

  #validateAllowed() {
      const me = this;
      let list = Array.from(me.children).filter(el => el.slot && el.slot !== 'body');
      if (list.length > 0) throw new Error(`Custom element injection must contain slot="body" attribute! Element: ${me.tagName}, ID: ${me.id}`);
      list = Array.from(me.children).filter(el => !el.slot);
      const tagList = ['TEMPLATE'];
      const allowed = GSDOM.isAllowed(list, tagList);
      if (!allowed) throw new Error(GSDOM.toValidationError(me, tagList));
  }

   get isFlat() {
      const me = this;
      return me.hasAttribute('flat') ? super.isFlat : true;
   }

   async getTemplate() {
      const me = this;
      switch (me.layout) {
         case 'floating': return me.#getFloating();
         case 'vertical': return me.#getVertical();
         default: return me.#getHorizontal();
      }
   }

   #getFloating() {
      const me = this;
      return `
      <div class="row ${me.css}">
         <div class="form-floating ${me.#cssCheck} ${me.cellField}">
            ${me.#input}
            ${me.#label}
         </div>
         ${me.#info}
      </div>`;
   }

   #getVertical() {
      const me = this;
      return `
      <div class="row ${me.css}">
        <div class="col-12">
            ${me.#label}
        </div>
         <div class="${me.#cssCheck} ${me.cellField}">
            ${me.#input}
         </div>
         ${me.#info}   
      </div>      
      `;
   }

   #getHorizontal() {
      const me = this;
      return `
      <div class="row form-group ${me.css}">
         ${me.#labelWrap}
         ${me.#field}
         ${me.#info}
      </div>`;
   }

   get #input() {
      const me = this;
      const tpl = me.query('template');
      if (tpl) return tpl.innerHTML;
      return `<input is="gs-ext-input" class="${me.#cssField} ${me.cssField}" 
               id="${me.name}" name="${me.name}" type="${me.#type}" ${me.#placeholder}
               ${me.#autocopy} ${me.#autoselect}
               ${me.#autocomplete} ${me.#autocapitalize} ${me.#multiple} ${me.#checked}
               ${me.#mask} ${me.#pattern} ${me.#value} ${me.#list} ${me.#accept}
               ${me.#step} ${me.#min} ${me.#max} ${me.#value} 
               ${me.#minlength} ${me.#maxlength} title="${me.description}"
               ${me.#readonly} ${me.#required} ${me.#disabled}
               >`;
   }

   get #label() {
      const me = this;
      return `<label class="${me.#cssLabel} ${me.cssLabel} user-select-none" for="${me.name}">${me.label}</label>`;
   }

   get #labelWrap() {
      const me = this;
      return `<div class="${me.cellLabel}">${me.#label}</label></div>`;
   }

   get #cssField() {
      const me = this;
      if (me.#isCheckable) return 'form-check-input ms-0';
      if (me.#isRange) return 'form-range';
      return 'form-control';
   }

   get #cssLabel() {
      const me = this;
      if (me.#isCheckable) return 'form-check-label';
      if (me.layout === 'floating') return 'ms-2';
      return me.#isVertical ? 'form-label' : '';
   }

   get #cssCheck() {
      const me = this;
      if (me.#isCheckable) {
         return me.#isSwitch ? 'form-check form-switch ps-3 fs-5' : 'form-check';
      }
      return '';
   }

   get #field() {
      const me = this;
      return `
      <div class="${me.#cssCheck} ${me.cellField}">
         <slot name="body">
         ${me.#input}         
         </slot>
      </div>`;
   }

   get #info() {
      const me = this;
      if (!me.#hasTooltip) return '';
      if (!me.#tooltip) return '';
      if (me.hasIcon) return `
      <div class="col-auto">
         ${me.#tooltip}
         ${me.#icon}
      </div>`;
      return me.#tooltip;
   }

   get #autocopy() {
      return this.autocopy ? `autocopy` : '';
   }

   get #autoselect() {
      return this.autoselect ? `autocopy` : '';
   }

   get hasIcon() {
      return GSAttr.get(this, 'icon') !== 'false';
   }

   get #icon() {
      const me = this;
      return me.hasIcon ? `<i class="${me.icon}"></i>` : '';
   }

   get #type() {
      const me = this;
      return me.#isSwitch ? 'checkbox' : me.type;
   }

   get #isCheckable() {
      const me = this;
      return me.#isChecked || me.#isRadio || me.#isSwitch;
   }

   get #hasTooltip() {
      return customElements.get('gs-tooltip');
   }

   get #tooltip() {
      const me = this;
      const tgt = me.hasIcon ? '' : `target="${me.name}"`;
      return me.description.trim() ? `<gs-tooltip placement="${me.placement}" title="${me.description}" ${tgt}></gs-tooltip>` : '';
   }

   get #placeholder() {
      return this.placeholder ? `placeholder=${this.placeholder}` : '';
   }

   get #pattern() {
      const me = this;
      return me.#isText && me.pattern ? `pattern=${me.pattern}` : '';
   }

   get #mask() {
      const me = this;
      return me.#isText && me.mask ? `mask=${me.mask}` : '';
   }

   get #disabled() {
      return this.disabled ? `disabled` : '';
   }

   get #checked() {
      const me = this;
      return me.#isCheckable && me.checked ? `checked` : '';
   }

   get #isVertical() {
      return this.layout === 'vertical';
   }

   get #isChecked() {
      return this.type === 'checkbox';
   }

   get #isRadio() {
      return this.type === 'radio';
   }

   get #isSwitch() {
      return this.type === 'switch';
   }

   get #isNumber() {
      return this.type === 'number';
   }

   get #isRange() {
      return this.type === 'range';
   }

   get #isText() {
      return this.type === 'text';
   }

   get #isPassword() {
      return this.type === 'passsword';
   }

   get #isEmail() {
      return this.type === 'email';
   }

   get #isURL() {
      return this.type === 'url';
   }

   get #isFile() {
      return this.type === 'file';
   }

   get #multiple() {
      return this.multiple ? `multiple` : '';
   }

   get #readonly() {
      return this.readonly ? `readonly` : '';
   }

   get #required() {
      return this.required ? `required` : '';
   }

   get #accept() {
      const me = this;
      return me.#isFile && me.accept ? `accept=${me.accept}` : '';
   }

   get #autocapitalize() {
      return this.autocapitalize ? `autocapitalize=${this.autocapitalize}` : '';
   }

   get #autocomplete() {
      return this.autocomplete ? `autocomplete=${this.autocomplete}` : '';
   }

   get #value() {
      return this.value ? `value=${this.value}` : '';
   }

   get #list() {
      return this.list ? `list=${this.list}` : '';
   }

   get #max() {
      const me = this;
      return isNaN(me.max) ? '' : `max="${me.max}"`;
   }

   get #min() {
      const me = this;
      return isNaN(me.min) ? '' : `min="${me.min}"`;
   }

   get #maxlength() {
      const me = this;
      return isNaN(me.maxlength) ? '' : `maxlength="${me.maxlength}"`;
   }

   get #minlength() {
      const me = this;
      return isNaN(me.minlength) ? '' : `minlength="${me.minlength}"`;
   }

   get #step() {
      const me = this;
      return isNaN(me.step) ? '' : `step="${me.step}"`;
   }

   get css() {
      return GSAttr.get(this, 'css', '');
   }

   set css(val = '') {
      return GSAttr.set(this, 'css', val);
   }

   get cellLabel() {
      return GSAttr.get(this, 'cell-label', GSFormGroup.CSS_LABEL_CELL);
   }

   set cellLabel(val = '') {
      return GSAttr.set(this, 'cell-label', val);
   }

   get cellField() {
      const me = this;
      const val = (me.layout === 'horizontal') ? '6' : '11';
      return GSAttr.get(me, 'cell-field', `col-md-${val} col-sm-${val} col-xs11`);
   }

   set cellField(val = '') {
      return GSAttr.set(this, 'cell-field', val);
   }

   get cssLabel() {
      return GSAttr.get(this, 'css-label', GSFormGroup.CSS_LABEL);
   }

   set cssLabel(val = '') {
      return GSAttr.set(this, 'css-label', val);
   }

   get cssField() {
      const me = this;
      const mono = me.mask?.trim().length > 0 ? ' font-monospace ' : '';
      return mono + GSAttr.get(this, 'css-field', '');
   }

   set cssField(val = '') {
      return GSAttr.set(this, 'css-field', val);
   }

   /**
    * Visual layout (horizontal | vertical | floating)
    */
   get layout() {
      return GSAttr.get(this, 'layout', 'horizontal');
   }

   set layout(val = '') {
      return GSAttr.set(this, 'layout', val);
   }

   get description() {
      return GSAttr.get(this, 'description', '');
   }

   set description(val = '') {
      return GSAttr.set(this, 'description', val);
   }

   get placement() {
      const me = this;
      const dft = me.hasIcon ? 'right' : 'top';
      return GSAttr.get(this, 'placement', dft);
   }

   set placement(val = '') {
      return GSAttr.set(this, 'placement', val);
   }

   get icon() {
      return GSAttr.get(this, 'icon', GSFormGroup.CSS_ICON);
   }

   set icon(val = '') {
      return GSAttr.set(this, 'icon', val);
   }

   get label() {
      return GSAttr.get(this, 'label', '');
   }

   set label(val = '') {
      return GSAttr.set(this, 'label', val);
   }

   get placeholder() {
      return GSAttr.get(this, 'placeholder', '');
   }

   set placeholder(val = '') {
      return GSAttr.set(this, 'placeholder', val);
   }

   get name() {
      return GSAttr.get(this, 'name', '');
   }

   set name(val = '') {
      return GSAttr.set(this, 'name', val);
   }

   get type() {
      return GSAttr.get(this, 'type', 'text');
   }

   set type(val = '') {
      return GSAttr.set(this, 'type', val);
   }

   get pattern() {
      return GSAttr.get(this, 'pattern', '');
   }

   set pattern(val = '') {
      return GSAttr.set(this, 'pattern', val);
   }

   get mask() {
      return GSAttr.get(this, 'mask', '');
   }

   set mask(val = '') {
      return GSAttr.set(this, 'mask', val);
   }

   get disabled() {
      return this.hasAttribute('disabled');
   }

   set disabled(val = '') {
      return GSAttr.toggle(this, 'disabled', GSUtil.asBool(val));
   }

   get checked() {
      return this.hasAttribute('checked');
   }

   set checked(val = '') {
      return GSAttr.toggle(this, 'checked', GSUtil.asBool(val));
   }

   get multiple() {
      return this.hasAttribute('multiple');
   }

   set multiple(val = '') {
      return GSAttr.toggle(this, 'multiple', GSUtil.asBool(val));
   }

   get readonly() {
      return this.hasAttribute('readonly');
   }

   set readonly(val = '') {
      return GSAttr.toggle(this, 'readonly', GSUtil.asBool(val));
   }

   get required() {
      return this.hasAttribute('required');
   }

   set required(val = '') {
      return GSAttr.toggle(this, 'required', GSUtil.asBool(val));
   }

   get accept() {
      return GSAttr.get(this, 'accept', '');
   }

   set accept(val = '') {
      return GSAttr.set(this, 'accept', val);
   }

   get autocopy() {
      return this.hasAttribute('autocopy');
  }

  get autoselect() {
      return this.hasAttribute('autoselect');
  }
     
   get autocapitalize() {
      return GSAttr.get(this, 'autocapitalize', '');
   }

   set autocapitalize(val = '') {
      return GSAttr.set(this, 'autocapitalize', val);
   }

   get autocomplete() {
      return GSAttr.get(this, 'autocomplete', '');
   }

   set autocomplete(val = '') {
      return GSAttr.set(this, 'autocomplete', val);
   }

   get value() {
      return GSAttr.get(this, 'value', '');
   }

   set value(val = '') {
      return GSAttr.set(this, 'value', val);
   }

   get list() {
      return GSAttr.get(this, 'list', '');
   }

   set list(val = '') {
      return GSAttr.set(this, 'list', val);
   }

   get maxlength() {
      return GSAttr.getAsNum(this, 'maxlength', NaN);
   }

   set maxlength(val = '') {
      return GSAttr.setAsNum(this, 'maxlength', val);
   }

   get minlength() {
      return GSAttr.getAsNum(this, 'minlength', NaN);
   }

   set minlength(val = '') {
      return GSAttr.setAsNum(this, 'minlength', val);
   }

   get max() {
      return GSAttr.get(this, 'max', NaN);
   }

   set max(val = '') {
      return GSAttr.setAsNum(this, 'max', val);
   }

   get min() {
      return GSAttr.get(this, 'min', NaN);
   }

   set min(val = '') {
      return GSAttr.setAsNum(this, 'min', val);
   }

   get step() {
      return GSAttr.getAsNum(this, 'step', NaN);
   }

   set step(val = '') {
      return GSAttr.setAsNum(this, 'step', val);
   }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Renderer for panel layout 
 * @class
 * @extends {GSElement}
 */
class GSLayout extends GSElement {

    static {
        customElements.define('gs-layout', GSLayout);
        Object.seal(GSLayout);
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    async getTemplate(val = '') {
        const me = this;
        const list = GSItem.genericItems(me).map(el => me.#generateHtml(el));
        const html = await Promise.all(list);
        const type = me.isVertical ? 'flex-column' : 'flex-row';
        const top = me.isFlat ? '' : 'vh-100';
        return `<div class="${top} d-flex flex-fill ${type} ${me.css}" style="${this.getStyle()}">${html.join('')}</div>`
    }

    /**
     * Determine if gs-layout is nested in another layout
     * If nested, rendering is flat.
     * @returns {boolean}
     */
    get isFlat() {
        const me = this;
        if (me.owner instanceof GSLayout) return true;

        const el = me.closest('gs-layout');
        if (el && el !== me) return true;

        const parent = GSComponents.getOwner(me); // me.parentElement
        const style = window.getComputedStyle(parent);
        return style.display === 'flex' && style.flexGrow !== '0';
    }

    get anchor() {
        return 'afterend@self';
    }

    /**
     * Generate html injection source for an gs-item
     * 
     * @async
     * @param {HTMLElement} el 
     * @returns {Promise<string>}
     */
    async #generateHtml(el) {
        const me = this;
        const res = me.#resizable(el);

        const id = GSAttr.get(el, 'id');
        const name = GSAttr.get(el, 'name');
        const tpl = GSItem.getBody(el, me.isFlat);

        const style = me.#generateStyle(el);
        const fixed = style.length > 10 ? true : false;
        const cls = me.#generateClass(el, fixed);

        const child = `<div class="${cls}" id="${name || GSID.next()}" ${style}>${tpl}</div>`;

        if (res) {
            const pos = me.#splitter(el);
            if (pos == 0) return child;
            let resize = '';
            if (pos > 0) {
                resize = me.isVertical ? 'top' : 'start';
            } else {
                resize = me.isVertical ? 'bottom' : 'end';
            }
            const split = `<gs-splitter resize="${resize}" split="${me.isVertical ? 'horizontal' : 'vertical'}" id="${id}"></gs-splitter>`;
            return pos == 1 ? [child, split].join('') : [split, child].join('');
        }

        return child;
    }

    /**
     * Generate min & max width / height for an gs-item
     * @param {HTMLElement} el 
     * @returns {string}
     */
    #generateStyle(el) {
        const me = this;
        const sfx = me.isVertical ? 'height' : 'width';
        const max = GSAttr.getAsNum(el, 'max', 0);
        const min = GSAttr.getAsNum(el, 'min', 0);
        const smax = max > 0 ? `max-${sfx}: ${max}px;` : '';
        const smin = min > 0 ? `min-${sfx}: ${min}px;` : '';
        return ['style="', smax, smin, '"'].join('');
    }

    /**
    * Generate list of css classes for an gs-item
    * @param {HTMLElement} el 
    * @returns {string}
    */
    #generateClass(el, fixed = false) {
        const me = this;
        const res = me.#resizable(el);

        const css = GSAttr.get(el, 'css');
        let vpos = GSAttr.get(el, 'v-pos');
        let hpos = GSAttr.get(el, 'h-pos');

        hpos = hpos ? `justify-content-${hpos}` : '';
        vpos = vpos ? `align-items-${vpos}` : '';

        const cls = ['d-flex', hpos, vpos];
        if (res == false && fixed == false) cls.push('flex-fill');

        cls.push(css);

        return cls.join(' ');
    }

    /**
     * Detect splitter target (previous | next | not supported)
     * @param {HTMLElement} el 
     * @returns {number} -1|0|1
     */
    #splitter(el) {
        const me = this;
        const start = el.previousElementSibling;
        const end = el.nextElementSibling;
        if (!end && !start) return 0;
        if (!end) return -1;
        if (!start) return 1;

        if (!me.#resizable(end)) return 1;
        if (!me.#resizable(start)) return -1;

        return 0;
    }

    /**
     * Check if gs-item element has gs-splitter
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    #resizable(el) {
        return GSAttr.getAsBool(el, 'resizable', false);
    }

    /**
     * Check if layout is vertical or horizontal
     * @returns {boolean}
     */
    get isVertical() {
        return GSAttr.get(this, 'type', 'vertical') === 'vertical';
    }

    /**
     * Get user defined css for a layout panel
     * @returns {string}
     */
    get css() {
        return GSAttr.get(this, 'css');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Renderer for bootstrap list group 
 * <gs-list css="">
 *     <gs-item css="" action="" target="" toggle="" target="" dismiss="" template="" title="">
 * </gs-list>
 * @class
 * @extends {GSElement}
 */
class GSList extends GSElement {


    static {
        customElements.define('gs-list', GSList);
        Object.seal(GSList);
    }

    static get observedAttributes() {
        const attrs = ['data'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        if (name === 'data') return this.load(newValue);
    }

    async getTemplate(val = '') {
        const me = this;
        const html = await me.#render();
        return `<div class="list-group ${me.css}">${html}</div>`;
    }

    async #render() {
        const me = this;
        const list = GSItem.genericItems(me).map(el => me.#html(el));
        //const html = await Promise.all(list);
        // return html.join('');
        return list.join('');
    }

    //async 
    #html(el) {
        const me = this;
        const message = me.#title(el);
        //const tpl = await GSItem.getTemplate(el);
        const tpl = GSItem.getBody(el);
        const css = GSItem.getCSS(el);
        const href = GSItem.getHref(el);

        const dataAttrs = GSAttr.dataToString(el);
        const dataBS = GSItem.getAttrs(el);

        const icon = GSItem.getIcon(el);
        const icoCSS = icon ? `<i class="${icon}"></i>` : '';

        const active = me.#getActive(el) ? 'active' : '';
        const select = me.selectable ? 'is="gs-ext-navlink"' : 'ignore';
        const hreftgt = href && href !== '#' ? `target=${GSItem.getTarget(el)}` : '';

        return `<a  ${select} class="list-group-item list-group-item-action ${active} ${css}"
                href="${href}" ${hreftgt} ${dataBS} ${dataAttrs}>${icoCSS} ${tpl || message}</a>`;
    }

    #title(el) {
        return GSAttr.get(el, 'title');
    }

    #getActive(el) {
        return GSAttr.getAsBool(el, 'active');
    }

    get selectable() {
        return GSAttr.getAsBool(this, 'selectable', true);
    }

    /**
     * Load data from various sources
     * 
     * @param {JSON|func|url} val 
     * @async
     * @returns {Promise}
     */
    async load(val = '') {
        const data = await GSLoader.loadData(val);
        if (!GSUtil.isJsonType(data)) return;
        const me = this;
        const src = GSItem.generateItem(data);
        GSDOM$1.setHTML(me, src);
        GSEvent.deattachListeners(me);
        me.connectedCallback();
        return data;
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Bootstrap modal dialog support
 * @class
 * @extends {GSElement}
 */
class GSModal extends GSElement {

  static #actions = ['ok', 'cancel'];

  static {
    customElements.define('gs-modal', GSModal);
    Object.seal(GSModal);
  }

  static get observedAttributes() {
    const attrs = ['cancelable', 'closable', 'title', 'visible'];
    return GSElement.observeAttributes(attrs);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    me.#update();
    if (name === 'visible') {
      if (me.visible) {
        me.#showEL('.modal');
        me.#showEL('.modal-backdrop');
        me.focusable().focus();
      } else {
        me.#hideEL('.modal');
        me.#hideEL('.modal-backdrop');
        me.normal();
      }
      GSEvent.send(me, 'visible', { type: 'modal', ok: me.visible }, true, true);
    }
  }

  onReady() {
    const me = this;
    me.attachEvent(me, 'click', me.#onClick.bind(me));
    me.attachEvent(me, 'action', me.#onClick.bind(me));
    me.attachEvent(me, 'form', me.#onForm.bind(me));
    me.attachEvent(document, 'keyup', me.#onEscape.bind(me));
    super.onReady();
    if (me.visible) me.open();
  }

  #onForm(e) {
    const me = this;
    GSEvent.prevent(e);
    const sts = GSEvent.send(me, 'data', { type: 'modal', data: e.detail.data, evt: e }, true, true, true);
    if (sts) me.close();
  }

  #onEscape(e) {
    const me = this;
    if (!me.cancelable) return;
    if (e.key === 'Escape') me.close();
  }

  #onClick(e) {

    const me = this;
    const action = me.#isAcceptedAction(e);
    if (!action) return;

    const isOk = action === 'ok';
    const forms = GSDOM$1.queryAll(me, 'form');
    const processForms = isOk && forms.length > 0;

    if (processForms) {
      const invalid = forms.filter(form => form.checkValidity() == false);
      invalid.forEach(form => me.#reportForm(form));
      if (invalid.length === 0) forms.forEach(form => me.#submitForm(form));

      const els = invalid.map(form => GSDOM$1.queryAll(form, 'textarea, input, select').filter(el => el.checkValidity() == false));
      if (els.length > 0) GSEvent.send(me, 'error', { type: 'modal', data: els }, true, true, true);
      return;
    }

    let sts = true;
    try {
      sts = GSEvent.send(me, 'action', { type: 'modal', ok: isOk, evt: e }, true, true, true);
    } finally {
      if (sts) me.close(null, isOk);
    }
  }

  #submitForm(form) {
    try {
      GSEvent.send(form, 'action', { action: 'submit' });
    } catch (e) {
      console.log(e);
    }
  }

  #reportForm(form) {
    try {
      form.reportValidity();
    } catch (e) {
      console.log(e);
    }
  }

  #getAction(e) {
    const el = e.composedPath().shift();
    return el?.dataset?.action || e.detail.action || el?.type;
  }

  #isAcceptedAction(e) {
    const action = this.#getAction(e);
    const isOk = GSModal.#actions.includes(action);
    if (isOk) GSEvent.prevent(e);
    return isOk ? action : null;
  }

  get #size() {
    switch (this.size) {
      case 'extra' : return 'modal-xl';
      case 'large' : return 'modal-lg';
    }
    return '';
  }

  #setSize(size = '') {
    const me = this;
    const dlg = me.query('.modal-dialog');
    if (!dlg) return;
    requestAnimationFrame(() => {
      dlg.classList.remove('modal-xl', 'modal-lg');
      if (size) dlg.classList.add(size);
    });
  }

  /**
   * Change size of modal window to "large"
   */
  large() {
    this.#setSize('modal-lg');
  }

  /**
   * Change size of modal window to "extra large"
   */
  extra() {
    this.#setSize('modal-xl');
  }

  /**
   * Change size of modal window to "default"
   */
  normal() {
    this.#setSize();
  }

  /**
   * Generic modal popup function
   * @param {string} title Modal title
   * @param {string} message Modal message 
   * @param {boolean} closable Can user close it (close button)
   * @param {boolean} cancelable Is cancel button available
   * @returns {Promise}
   */
  info(title = '', message = '', closable = false, cancelable = false) {
    const me = this;
    me.title = title;
    me.body = message;
    me.cancelable = cancelable;
    me.closable = closable;
    me.open();
    if (closable || cancelable) return me.waitEvent('action');
  }

  confirm(title = '', message = '') {
    const me = this;
    return me.info(title, message, true, false);
  }

  prompt(title = '', message = '') {
    const me = this;
    return me.info(title, message, true, true);
  }

  /**
   * Show modal panel
   */
  open(e) {
    GSEvent.prevent(e);
    const me = this;
    const sts = GSEvent.send(me, 'open', { type: 'modal' }, true, true, true);
    if (sts) me.visible = true;
  }

  /**
   * Hide modal panel
   */
  close(e, ok = false) {
    GSEvent.prevent(e);
    const me = this;
    const sts = GSEvent.send(me, 'close', { type: 'modal', isOk: ok }, true, true, true);
    if (sts) me.visible = false;
  }

  /**
   * Toggle modal panel
   */
  toggle() {
    const me = this;
    me.visible = !me.visible;
  }

  /**
   * Return active button
   * @returns {HTMLButtonElement|GSButton}
   */
  focusable() {
    const me = this;
    if (me.cancelable) return me.#buttonCancelEl;
    if (me.closable) return me.#buttonOkEl;
    return me;
  }

  get #buttonOkEl() {
    return this.query('.modal-ok');
  }

  get #buttonCancelEl() {
    return this.query('.modal-cancel');
  }

  #showEL(name) {
    const el = this.query(name);
    if (!el) return;
    el.classList.remove('d-none');
    el.classList.add('show', 'd-block');
  }

  #hideEL(name) {
    const el = this.query(name);
    if (!el) return;
    el.classList.add('d-none');
    el.classList.remove('show', 'd-block');
  }

  #update() {
    const me = this;
    GSDOM$1.toggle(me.#buttonOkEl, !me.closable);
    GSDOM$1.toggle(me.#buttonCancelEl, !me.cancelable);
    const css = `justify-content-${me.align}`;
    const footer = me.query('.modal-footer');
    GSDOM$1.toggleClass(footer, css, true);
  }

  /**
   * Search for named slot tag or css selector 
   * @param {string} name Tagged slot  name
   * @param {*} qry CSS selector
   * @returns {HTMLElement|Array<HTMLElement>}
   */
  #findSlotOrEl(name = '', qry = '') {
    const me = this;
    let el = name ? me.self.querySelector(`slot[name="${name}"]`) : null;
    if (!el) el = me.self.querySelector(qry);
    return el;
  }


  get size() {
    return GSAttr.get(this, 'size', '');
  }

  set size(val = '') {
    GSAttr.set(this, 'size', val);
  }

  get title() {
    //return this.#findSlotOrEl('title', '.modal-title');
    return this.query('.modal-title');
  }

  set title(val = '') {
    GSDOM$1.setHTML(this.title, val);
  }

  get body() {
    // return this.#findSlotOrEl('body', '.modal-body');
    return this.query('.modal-body');
  }

  set body(val = '') {
    GSDOM$1.setHTML(this.body, val);
  }

  get visible() {
    return GSAttr.getAsBool(this, 'visible', false);
  }

  set visible(val = false) {
    GSAttr.setAsBool(this, 'visible', val);
  }

  get closable() {
    return GSAttr.getAsBool(this, 'closable', true);
  }

  set closable(val = true) {
    GSAttr.setAsBool(this, 'closable', val);
    this.#update();
  }

  get cancelable() {
    return GSAttr.getAsBool(this, 'cancelable', true);
  }

  set cancelable(val = true) {
    GSAttr.setAsBool(this, 'cancelable', val);
    this.#update();
  }

  /**
   * Align buttons start | end | center
   */
  get align() {
    return GSAttr.get(this, 'button-align', 'end');
  }

  set align(val = 'end') {
    GSAttr.set(this, 'button-align', val);
    this.#update();
  }

  get buttonOk() {
    return GSAttr.get(this, "button-ok", "Ok");
  }

  set buttonOk(val = 'Ok') {
    GSAttr.set(this, "button-ok", val);
  }

  get buttonCancel() {
    return GSAttr.get(this, "button-cancel", "Cancel");
  }

  set buttonCancel(val = 'Cancel') {
    GSAttr.set(this, "button-cancel", val);
  }

  get cssButtonOk() {
    return GSAttr.get(this, "css-button-ok", "btn-primary");
  }

  get cssButtonCancel() {
    return GSAttr.get(this, "css-button-cancel", "btn-secondary");
  }

  get cssModal() {
    return GSAttr.get(this, "css-modal", "");
  }

  get cssContent() {
    return GSAttr.get(this, "css-content", "");
  }

  get cssHeader() {
    return GSAttr.get(this, "css-header", "");
  }

  get cssTitle() {
    return GSAttr.get(this, "css-title", "");
  }

  get cssBody() {
    return GSAttr.get(this, "css-body", "");
  }

  get cssFooter() {
    return GSAttr.get(this, "css-footer", "");
  }

  set cssModal(val = '') {
    return GSAttr.set(this, "css-modal", val);
  }

  set cssContent(val = '') {
    return GSAttr.set(this, "css-content", val);
  }

  set cssHeader(val = '') {
    return GSAttr.set(this, "css-header", val);
  }

  set cssTitle(val = '') {
    return GSAttr.set(this, "css-title", val);
  }

  set cssBody(val = '') {
    return GSAttr.set(this, "css-body", val);
  }

  set cssFooter(val = '') {
    return GSAttr.set(this, "css-footer", val);
  }

  // css-modal, css-content css-header css-title css-body css-footer
  async getTemplate(val = '') {
    if (val) return super.getTemplate(val);
    const me = this;
    return `
         <div class="modal d-none fade ${me.cssModal}">
         <div class="modal-dialog modal-dialog-centered ${me.#size}">
           <div class="modal-content ${me.cssContent}">
             <div class="modal-header border-0 user-select-none ${me.cssHeader}">
               <div class="modal-title ${me.cssTitle}">
                 <slot name="title"></slot>
               </div>
             </div>
             <div class="modal-body ${me.cssBody}">
               <slot name="body"></slot>
             </div>
             <div class="modal-footer border-0 user-select-none justify-content-${me.align} ${me.cssFooter}">
               <button class="btn ${me.cssButtonCancel} modal-cancel" data-action="cancel">${me.buttonCancel}</button>
               <button class="btn ${me.cssButtonOk} modal-ok" data-action="ok">${me.buttonOk}</button>
             </div>
           </div>
         </div>
       </div>
       <div class="modal-backdrop d-none fade "></div>    
     `
  }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Renderer for nav bar/list
 * @class
 * @extends {GSElement}
 */
class GSNav extends GSElement {

    static {
        customElements.define('gs-nav', GSNav);
        Object.seal(GSNav);
    }

    static get observedAttributes() {
        const attrs = ['data'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        if (name === 'data') return this.load(newValue);
    }

    async getTemplate(val = '') {
        const me = this;
        const items = GSItem.genericItems(me);
        //const btns = items.map( el => el.getTemplate()).join('');
        const btns = items.map(el => me.#getTemplateChild(el));
        //const tag = me.#isBar ? 'nav' : 'ul';
        const css = me.#isBar ? '' : 'flex-column';

        return `
          <ul class="nav ${css} ${me.#cssnav}">
            ${btns.join('')}
          </ul>
        `;
    }

    #getTemplateChild(el) {
        const me = this;
        // return me.#isBar ? me.#btn(el) : me.#wrap(el);
        return me.#wrap(el);
    }

    get #cssnav() {
        return this.#getCssNav(this);
    }

    get #isBar() {
        return GSAttr.getAsBool(this, 'bar', true);
    }

    #wrap(el) {
        const me = this;
        return `<li class="nav-item ${me.#getCssNavWrap(el)}">${me.#btn(el)}</li>`;
    }

    #btn(el) {
        const me = this;
        const dataAttrs = GSAttr.dataToString(el);
        const cssnav = me.#getCssNav(el);
        const cssactive = me.#getCssActiveTab(el);
        const title = me.#getTitle(el);
        const icon = GSItem.getIcon(el);
        const href = GSItem.getHref(el);

        const iconTpl = icon ? `<i class="${icon}"></i>` : '';
        //const contentTpl = me.rtl ? `${title} ${iconTpl}` : `${iconTpl} ${title}`;
        const contentTpl = `${iconTpl} ${title}`;
        const hreftgt = href && href !== '#' ? `target=${GSItem.getTarget(el)}` : '';
        const attrs = GSItem.getAttrs(el);

        return `<a type="button" role="nav" is="gs-ext-navlink" class="nav-link ${cssnav} ${cssactive}" 
                href="${href}" ${hreftgt} id="${GSID.id}-nav" ${attrs} ${dataAttrs}>${contentTpl}</a>`;

    }

    #getCssNavWrap(el) {
        return GSAttr.get(el, 'css-nav-wrap');
    }

    #getCssNav(el) {
        return GSAttr.get(el, 'css-nav');
    }

    #getCssActiveTab(el) {
        return this.#getActive(el) ? 'active' : '';
    }

    #getActive(el) {
        return GSAttr.getAsBool(el, 'active');
    }

    #getTitle(el) {
        return GSAttr.get(el, 'title');
    }


    /**
     * Load data from various sources
     * 
     * @async
     * @param {JSON|func|url} val 
     * @returns {Promise}
     */
    async load(val = '') {
        const data = await GSLoader.loadData(val);
        if (!GSUtil.isJsonType(data)) return;
        const me = this;
        const src = GSItem.generateItem(data);
        GSDOM$1.setHTML(me, src);
        GSEvent.deattachListeners(me);
        me.connectedCallback();
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Bootstrap modal dialog support
 * @class
 * @extends {GSElement}
 */
class GSOffcanvas extends GSElement {

  static {
    customElements.define('gs-offcanvas', GSOffcanvas);
    Object.seal(GSOffcanvas);
  }

  static get observedAttributes() {
    const attrs = ['title', 'visible', 'backdrop', 'placement', 'css', 'closable'];
    return GSElement.observeAttributes(attrs);
  }

  constructor() {
    super();
    this.css = this.css || 'border shadow-sm';
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    me.#update(name, oldValue, newValue);
    if (name === 'visible') GSEvent.send(me, 'action', { type: 'offcanvas', ok: newValue });
  }

  async getTemplate(val = '') {
    return val ? super.getTemplate(val) : this.#html();
  }

  onReady() {
    const me = this;
    super.onReady();
    me.attachEvent(me.#backdropEl, 'click', me.close.bind(me));
    if (me.autoclose) {
      me.attachEvent(me.#canvasEl, 'mouseleave', me.close.bind(me));
      if (me.min > 0) me.attachEvent(me.#canvasEl, 'mouseenter', me.open.bind(me));
    }
    me.#update(null, true, false);
  }

  #update(name = '', oldValue = '', newValue = '') {

    if (oldValue === newValue) return;
    const me = this;

    if (me.#titleEl) GSDOM$1.setHTML(me.#titleEl, me.title);

    GSDOM$1.toggleClass(me.#canvasEl, 'visible', true);
    GSDOM$1.toggleClass(me.#closeEl, 'invisible', !me.closable);
    GSDOM$1.toggleClass(me.#backdropEl, 'show', me.backdrop && me.visible);

    me.#updateAnim();
    me.#updateShow();
    me.#updateBackdrop();
    me.#updatePlacement(name, oldValue, newValue);
    me.#updateCSS(name, oldValue, newValue);

  }

  #updateAnim() {

    const me = this;
    if (!me.autoclose) return;

    const open = me.visible;
    const pos = me.isHorizontal ? 'width' : 'height';
    const val = open ? me.max : me.min;

    me.#canvasEl.style.transitionProperty = pos;
    me.#canvasEl.style.transitionDuration = `${me.transitionDuration}s`;
    me.#canvasEl.style.transitionTimingFunction = me.transitionFunction;
    me.#canvasEl.style[pos] = `${val}px`;
  }

  #updateShow() {
    const me = this;
    if (me.min === 0 && me.visible) return GSDOM$1.toggleClass(me.#canvasEl, 'show', me.visible);
    setTimeout(() => {
      GSDOM$1.toggleClass(me.#canvasEl, me.min === 0 ? me.visible : 'show', true);
    }, GSDOM$1.SPEED);
  }

  #updateBackdrop() {
    const me = this;
    setTimeout(() => {
      GSDOM$1.toggleClass(me.#backdropEl, 'invisible', !(me.backdrop && me.visible));
    }, GSDOM$1.SPEED);
  }

  #updatePlacement(name = '', oldValue = '', newValue = '') {
    if (name !== 'placement') return;
    const me = this;
    GSDOM$1.toggleClass(me.#canvasEl, `offcanvas-${oldValue}`, false);
    GSDOM$1.toggleClass(me.#canvasEl, `offcanvas-${newValue}`, true);
  }

  #updateCSS(name = '', oldValue = '', newValue = '') {
    if (name !== 'css') return;
    const me = this;
    GSDOM$1.toggleClass(me.#canvasEl, oldValue, false);
    GSDOM$1.toggleClass(me.#canvasEl, newValue, true);
  }

  get isVertical() {
    return !this.isHorizontal;
  }

  get isHorizontal() {
    return this.placement === 'start' || this.placement === 'end';
  }

  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

  toggle() {
    this.visible = !this.visible;
  }

  get css() {
    return GSAttr.get(this, 'css', '');
  }

  get cssTitle() {
    return GSAttr.get(this, 'css-title', 'fs-5');
  }

  get cssHead() {
    return GSAttr.get(this, 'css-head', '');
  }

  get cssBody() {
    return GSAttr.get(this, 'css-body', '');
  }

  set css(val = '') {
    GSAttr.set(this, 'css', val);
  }

  get transitionDuration() {
    return GSAttr.getAsNum(this, 'duration', '0.2');
  }

  set transitionDuration(val = '') {
    GSAttr.set(this, 'duration', val);
  }

  get transitionFunction() {
    return GSAttr.get(this, 'transition', 'linear');
  }

  set transitionFunction(val = '') {
    GSAttr.set(this, 'transition', val);
  }

  get title() {
    return GSAttr.get(this, 'title');
  }

  set title(val = '') {
    GSAttr.set(this, 'title', val);
  }

  get visible() {
    return GSAttr.getAsBool(this, 'visible', false);
  }

  set visible(val = false) {
    GSAttr.setAsBool(this, 'visible', val);
  }

  get autoclose() {
    return GSAttr.getAsBool(this, 'autoclose', false);
  }

  set autoclose(val = false) {
    GSAttr.setAsBool(this, 'autoclose', val);
  }

  get closable() {
    return GSAttr.getAsBool(this, 'closable', true);
  }

  set closable(val = true) {
    GSAttr.setAsBool(this, 'closable', val);
    this.#update();
  }

  get placement() {
    const me = this;
    return GSAttr.get(me, 'placement', me.target?.dataset?.bsPlacement || 'start');
  }

  set placement(val = '') {
    return GSAttr.set(this, 'placement', val);
  }

  get backdrop() {
    const me = this;
    return GSAttr.getAsBool(me, 'backdrop', me.target?.dataset?.bsBackdrop || 'false');
  }

  set backdrop(val = '') {
    return GSAttr.set(this, 'backdrop', val);
  }

  get scroll() {
    const me = this;
    return GSAttr.getAsBool(me, 'scroll', me.target?.dataset?.bsScroll || 'false');
  }

  set scroll(val = '') {
    return GSAttr.set(this, 'scroll', val);
  }

  get min() {
    return GSAttr.getAsNum(this, 'min', 0);
  }

  set min(val = false) {
    GSAttr.set(this, 'min', GSUtil.asNum(val));
  }

  get max() {
    return GSAttr.getAsNum(this, 'max', 0);
  }

  set max(val = false) {
    GSAttr.set(this, 'max', GSUtil.asNum(val));
  }

  get #canvasEl() {
    return this.query('.offcanvas');
  }

  get #titleEl() {
    return this.query('.offcanvas-title');
  }

  get #backdropEl() {
    return this.query('.offcanvas-backdrop');
  }

  get #closeEl() {
    return this.query('.btn-close[data-bs-dismiss="offcanvas"]');
  }

  get #headSlot() {
    return this.querySelector('[slot="header"]');
  }

  #html() {
    const me = this;
    const title = me.title ? `<div class="offcanvas-title ${me.cssTitle}">${me.title}</div>` : '';
    const closeBtn = me.closable ? `<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>` : '';
    const header = title || closeBtn || me.#headSlot ? `<div class="offcanvas-header ${me.cssHead}"><slot name="header">${title}${closeBtn}</slot></div>` : '';
    return `
      <div class="offcanvas offcanvas-${me.placement} overflow-hidden ${me.css}" data-bs-scroll="${me.scroll}" data-bs-backdrop="${me.backdrop}" tabindex="-1">      
      ${header}
      <div class="offcanvas-body  ${me.cssBody}">
        <slot name="body"></slot>
      </div>
    </div>
    <div class="offcanvas-backdrop fade ${me.backdrop && me.visible ? 'show' : 'invisible'}"></div>
    `
  }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A generic set of static functions used across GS WebComponents framework
 * used for placing elements at fixed positions.
 * Also used to replace Bootstrap popper.
 * @class
 */
class GSPopper {

	/**
	 * Get element offset position
	 * Returns absolute position {left:0, top:0, width:0, height:0,centeY:0 centerX:0}
	 * @param {HTMLElement} el 
	 * @returns {object} 
	 */
	static getOffset(el) {
		const rect = el.getBoundingClientRect();
		const sx = window.scrollX;
		const sy = window.scrollY;
		const obj = {
			left: rect.left + sx,
			right: rect.right + sx,
			top: rect.top + sy,
			bottom: rect.bottom + sy,
			height: rect.height,
			width: rect.width,
			x: rect.x + sx,
			y: rect.y + sy
		};
		obj.centerX = obj.left + (obj.width / 2);
		obj.centerY = obj.top + (obj.height / 2);
		return obj;
	}

	/**
	 * Return element position and size without padding
	 * Returned objext is the same format as native getBoundingRect
	 * @param {HTMLElement} element 
	 * @returns {object} 
	 */
	static boundingRect(element, calcPadding) {

		const rect = element.getBoundingClientRect();
		const padding = GSPopper.elementPadding(calcPadding ? element : null);

		const paddingX = padding.x;
		const paddingY = padding.y;

		const elementWidth = element.clientWidth - paddingX;
		const elementHeight = element.clientHeight - paddingY;

		const elementX = rect.left + padding.left;
		const elementY = rect.top + padding.top;

		const centerX = (elementWidth / 2) + elementX;
		const centerY = elementY + (elementHeight / 2);

		return {
			width: elementWidth,
			height: elementHeight,
			top: elementY,
			left: elementX,
			x: elementX,
			y: elementY,
			centerX: centerX,
			centerY: centerY
		};
	}

	/**
	 * Calculate element padding
	 * @param {HTMLElement} element 
	 * @returns {object}
	 */
	static elementPadding(element) {

		const obj = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			x: 0,
			y: 0
		};

		const isEl = element instanceof HTMLElement;
		if (!isEl) return obj;
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
	 * Fixed positioning on a viewport.
	 * @param {string} placement Location on target element top|bottom|left|right
	 * @param {HTMLElement} source Element to show
	 * @param {HTMLElement} target Element location at which to show
	 * @param {boolean} arrow if true, will calculate arrow position
	 * @returns {void}
	 */
	static popupFixed(placement = 'top', source, target, arrow) {

		if (!source) return false;
		if (!target) return false;

		const pos = GSPopper.#fromPlacement(placement);

		if (!GSPopper.#isPlacementValid(pos)) {
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

		const rect = GSPopper.boundingRect(target, arrow instanceof HTMLElement);
		const arect = GSPopper.#updateArrow(source, arrow, pos);

		const obj = {
			x: rect.centerX,
			y: rect.centerY,
			offH: offh,
			offW: offw,
			srcH: source.clientHeight,
			srcW: source.clientWidth
		};

		GSPopper.#calcFixed(pos, obj, rect, arect);

		source.style.transform = `translate(${obj.x}px, ${obj.y}px)`;

	}

	/**
	 * Place element around target element. Bootstrap support for popup etc.
	 * @param {string} placement Location on target element top|bottom|left|right
	 * @param {HTMLElement} source Element to show
	 * @param {HTMLElement} target Element location at which to show
	 * @param {boolean} arrow if true, will calculate arrow position
	 * @returns {void}
	 */
	static popupAbsolute(placement = 'top', source, target, arrow) {

		if (!source) return false;
		if (!target) return false;

		const pos = GSPopper.#fromPlacement(placement);

		if (!GSPopper.#isPlacementValid(pos)) {
			GSLog.warn(source, `Invalid popover position: ${placement}!`);
			return;
		}

		arrow.style.position = 'absolute';
		source.style.position = 'absolute';
		source.style.margin = '0px';
		source.style.inset = GSPopper.#inset(pos);

		const srect = source.getBoundingClientRect();
		const arect = arrow.getBoundingClientRect();
		const offset = GSPopper.getOffset(target);

		const obj = {
			x: offset.centerX,
			y: offset.centerY
		};

		const arr = {
			x: (srect.width / 2) - (arect.width / 2),
			y: (srect.height / 2) - (arect.height / 2)
		};

		GSPopper.#calcAbsolute(pos, obj, arr, srect, arect, offset);

		source.style.transform = `translate(${obj.x}px, ${obj.y}px)`;
		arrow.style.transform = `translate(${arr.x}px, ${arr.y}px)`;
		arrow.style.top = arr.top ? arr.top : '';
		arrow.style.left = arr.left ? arr.left : '';

	}

	static #calcAbsolute(pos, obj, arr, srect, arect, offset) {
		if (pos.isTop) {
			arr.y = 0;
			arr.left = '0px';
			obj.x = obj.x - (srect.width / 2);
			obj.y = -1 * (srect.bottom - offset.top + arect.height);
		} else if (pos.isBottom) {
			arr.y = 0;
			arr.left = '0px';
			obj.x = obj.x - (srect.width / 2);
			obj.y = offset.bottom + arect.height;
		} else if (pos.isStart) {
			arr.x = 0;
			arr.top = '0px';
			obj.x = -1 * (srect.right - offset.left + arect.width);
			obj.y = obj.y - (srect.height / 2);
		} else if (pos.isEnd) {
			arr.x = 0;
			arr.top = '0px';
			obj.x = offset.right + arect.width;
			obj.y = obj.y - (srect.height / 2);
		}
	}

	static #calcFixed(pos, obj, trect, arect) {
		if (pos.isTop) {
			obj.y = trect.top - obj.srcH - arect.size;
			obj.x = obj.x - obj.offW;
		} else if (pos.isBottom) {
			obj.y = trect.top + trect.height + arect.size;
			obj.x = obj.x - obj.offW;
		} else if (pos.isStart) {
			obj.x = trect.left - obj.srcW - arect.size;
			obj.y = obj.y - obj.offH + arect.size;
		} else if (pos.isEnd) {
			obj.x = trect.left + trect.width + arect.size;
			obj.y = obj.y - obj.offH + arect.size;
		}
	}

	static #inset(obj) {
		if (obj.isTop) {
			return 'auto auto 0px 0px';
		} else if (obj.isBottom) {
			return '0px auto auto 0px';
		} else if (obj.isStart) {
			return '0px 0px auto auto';
		} else if (obj.isEnd) {
			return '0px auto auto 0px';
		}
	}

	static #isPlacementValid(obj) {
		return obj.isStart || obj.isEnd || obj.isTop || obj.isBottom;
	}

	static #fromPlacement(placement) {
		return {
			isStart: placement == 'start' || placement == 'left',
			isEnd: placement == 'end' || placement == 'right',
			isTop: placement == 'top',
			isBottom: placement == 'bottom'
		}
	}

	static #updateArrow(element, arrow, pos) {

		if (!arrow) return { x: 0, y: 0, size: 0, width: 0, height: 0 };
		let shift = 0;
		const erect = GSPopper.boundingRect(element);
		const arect = GSPopper.boundingRect(arrow);

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
		Object.seal(GSPopper);
		globalThis.GSPopper = GSPopper;
	}
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * https://getbootstrap.com/docs/5.1/components/popovers/
 * Process Bootstrap popover definition
 * <gs-popover ref="#el_id" placement="top" title="" content="" trigger="focus hover"></gs-popover>
 * 
 * TODO - only basic implementation is done, more work required
 * @class
 * @extends {GSElement}
 */
class GSPopover extends GSElement {

    #unfocus = false;

    static {
        customElements.define('gs-popover', GSPopover);
        Object.seal(GSPopover);
        GSDOMObserver.registerFilter(GSPopover.#onMonitorFilter, GSPopover.#onMonitorResult);
    }

    /**
     * Filter function for monitor observer
     * @param {HTMLElement} el 
     * @returns {void}
     */
    static #onMonitorFilter(el) {
        if (!(el instanceof HTMLElement)) return false;
        if (el.tagName && el.tagName.startsWith('GS-')) return false;
        return GSPopover.#isPopover(el) && !GSPopover.#hasPopover(el);
    }

    /**
     * Function to attach gs-popover to the element
     * @param {HTMLElement} el 
     */
    static #onMonitorResult(el) {
        el.id = el.id || GSID.id;
        const popover = document.createElement('gs-popover');
        popover.ref = `#${el.id}`;
        requestAnimationFrame(() => {
            setTimeout(() => {
                el.parentElement.insertAdjacentElement('beforeend', popover);
            }, 100);
        });
    }

    constructor() {
        super();
    }

    onReady() {
        const me = this;
        super.onReady();
        me.#attachEvents();
    }

    // https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
    #attachEvents() {
        const me = this;
        if (me.isHoverTrigger) {
            GSEvent.attach(me, me.target, 'mouseover', me.show.bind(me));
            GSEvent.attach(me, me.target, 'mouseout', me.hide.bind(me));
        }
        if (me.isFocusTrigger) {
            GSEvent.attach(me, document.body, 'click', me.#focus.bind(me));
        }
    }

    #render(source) {
        const me = this;
        const arrowEl = source.querySelector('div.popover-arrow');
        GSPopper.popupAbsolute(me.placement, source, me.target, arrowEl);
        return source;
    }

    get #html() {
        const me = this;
        const head = me.title ? `<div class="popover-header ${me.cssHead}">${me.title}</div>` : '';
        return `
        <div class="popover bs-popover-auto fade ${me.css}" data-popper-placement="${me.placement}" style="${this.getStyle()}" role="tooltip">
            <div class="popover-arrow"></div>
            ${head}
            <div class="popover-body">${me.content}</div>
        </div>            
        `;
    }

    get target() {
        const me = this;
        if (me.ref) {
            let owner = me.owner;
            owner = GSDOM$1.isGSElement(me.owner) ? owner.self : owner;
            return owner.querySelector(me.ref);
        }
        return me.previousElementSibling || me.parentElement;
    }

    get css() {
        return GSAttr.get(this, 'css');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get cssHead() {
        return GSAttr.get(this, 'css-head', 'fs-3');
    }

    set cssHead(val = '') {
        return GSAttr.set(this, 'css-head', val);
    }

    get ref() {
        const me = this;
        return GSAttr.get(me, 'ref');
    }

    set ref(val = '') {
        return GSAttr.set(this, 'ref', val);
    }

    get title() {
        const me = this;
        return GSAttr.get(me, 'title') || GSAttr.get(me.target, 'title');
    }

    set title(val = '') {
        const me = this;
        return GSAttr.set(me, 'title', val);
    }

    get placement() {
        const me = this;
        return GSAttr.get(me, 'placement', me.target?.dataset?.bsPlacement || 'top');
    }

    set placement(val = '') {
        return GSAttr.set(this, 'placement', val);
    }

    get content() {
        const me = this;
        return GSAttr.get(me, 'content', me.target?.dataset?.bsContent || '');
    }

    set content(val = '') {
        return GSAttr.set(this, 'content', val);
    }

    get trigger() {
        const me = this;
        return GSAttr.get(me, 'trigger', me.target?.dataset?.bsTrigger || 'hover focus');
    }

    set trigger(val = '') {
        return GSAttr.set(this, 'trigger', val);
    }

    get isFocusTrigger() {
        return this.trigger.includes('focus');
    }

    get isHoverTrigger() {
        return this.trigger.includes('hover');
    }

    get visible() {
        return this.innerHTML.length !== 0;
    }

    get isFlat() {
        return true;
    }

    get anchor() {
        return 'self';
    }

    async getTemplate(def = '') {
        return '';
    }

    /**
     * Show popover     
     */
    show() {
        const me = this;
        const el = GSDOM$1.parse(me.#html, true);
        me.insertAdjacentElement('afterbegin', el);
        requestAnimationFrame(() => {
            me.#render(el);
            GSDOM$1.toggleClass(el, 'show', true);
        });
    }

    /**
     * Hide popover
     * @returns {boolean}
     */
    hide() {
        const me = this;
        if (me.#unfocus) return false;
        setTimeout(() => {
            GSDOM$1.setHTML(me, '');
        }, 250);
        return GSDOM$1.toggleClass(me.firstElementChild, 'show', false);
    }

    /**
     * Toggle popover on/off
     */
    toggle() {
        const me = this;
        me.visible ? me.hide() : me.show();
    }

    #focus(e) {
        const me = this;
        if (me.#unfocus) {
            me.#unfocus = false;
            me.hide();
            return;
        }
        const openable = !me.isHoverTrigger;
        if (e.target == me.target) {
            if (me.visible) {
                me.#unfocus = true;
            } else if (openable) {
                me.show();
            }
        } else if (openable && me.visible) me.hide();
    }

    /**
     * Check if element has attached tooltip
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    static #hasPopover(el) {
        return (el?.firstElementChild || el?.nextElementSibling) instanceof GSPopover;
    }

    /**
     * Check if standard element is tooltip defined
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #isPopover(el) {
        return el?.dataset?.bsContent && el?.dataset?.bsToggle === 'popover';
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Popup panel
 * NOTE: Must be rendered in body, as transform_translate(...) issues
 * @class
 * @extends {GSElement}
 */
class GSPopup extends GSElement {

    // element that opened context
    #caller = null;
    #online = false;
    #ready = false;
    #attached = false;

    static {
        customElements.define('gs-popup', GSPopup);
        Object.seal(GSPopup);
    }

    static get observedAttributes() {
        const attrs = ['visible', 'css'];
        return GSElement.observeAttributes(attrs);
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;

        if (name === 'visible') {
            me.#resize();
            GSDOM$1.toggleClass(me.#panel, 'invisible', !me.visible);
        }
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.#online = true;
        me.attachEvent(me, 'form', me.#onForm.bind(me));
    }

    disconnectedCallback() {
        const me = this;
        me.#online = false;
        super.disconnectedCallback();
    }

    async getTemplate(val = '') {
        const me = this;
        const tpl = await super.getTemplate(val);
        const state = me.visible ? '' : 'invisible';

        if (tpl) {
            requestAnimationFrame(() => {
                const slot = GSDOM$1.parse(tpl);
                for (let el of slot.body.children) {
                    GSDOM$1.appendChild(me, el);
                }
            });
        }

        return `<div class="position-${me.position} ${me.css} ${state}" style="${this.getStyle()}"><slot></slot></div>`;
    }

    onReady() {
        const me = this;
        if (me.#ready) return;
        me.#ready = true;
        me.#onReady();
        super.onReady();
    }

    get isFlat() {
        return this.parentElement !== document.body;
    }

    /**
     * NOTE: Fixed positioning must be rendered in body element 
     * to prevent css translate coordinates.
     */
    get anchor() {
        return 'beforeend@body';
    }

    get #panel() {
        return this.query('div');
    }

    get css() {
        return GSAttr.get(this, 'css');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    /**
     * Event on target element used to trigger popup
     */
    get event() {
        return GSAttr.get(this, 'event', 'click');
    }

    set event(val = '') {
        return GSAttr.set(this, 'event', val);
    }

    /**
     * Where to place popup relative to target element, only if v-pos and h-pos not used
     */
    get placement() {
        const me = this;
        return GSAttr.get(me, 'placement', me?.target?.datalist?.bsPlacement || '');
    }

    set placement(val = '') {
        return GSAttr.set(this, 'placement', val);
    }

    /**
     * CSS position value (absolute, fixed, relative ...)
     */
    get position() {
        const me = this;
        return GSAttr.get(me, 'position', 'absolute');
    }

    set position(val = '') {
        return GSAttr.set(this, 'position', val);
    }

    /**
     * Where to place popup relative to target element, only if v-pos and h-pos not used
     */
    get target() {
        const me = this;
        return GSAttr.get(me, 'target');
    }

    set target(val = '') {
        return GSAttr.set(this, 'target', val);
    }

    /**
     * Set popup visible or hiden
     */
    get visible() {
        return GSAttr.getAsBool(this, 'visible', false);
    }

    set visible(val = '') {
        return GSAttr.setAsBool(this, 'visible', val);
    }

    /**
     * Should auto close popup on mouse leave
     */
    get autoclose() {
        return GSAttr.getAsBool(this, 'autoclose', true);
    }

    set autoclose(val = '') {
        return GSAttr.getAsBool(this, 'autoclose', val);
    }

    /**
     * X-Axis popup position
     */
    get hPos() {
        return GSAttr.getAsNum(this, 'h-pos');
    }

    set hPos(val = '') {
        return GSAttr.setAsNum(this, 'h-pos', val);
    }

    /**
     * Y-Axis popup position
     */
    get vPos() {
        return GSAttr.getAsNum(this, 'v-pos');
    }

    set vPos(val = '') {
        return GSAttr.setAsNum(this, 'v-pos', val);
    }


    set wMax(val = '') {
        return GSAttr.setAsNum(this, 'w-max', val);
    }

    get wMax() {
        return GSAttr.getAsNum(this, 'w-max');
    }

    set wMin(val = '') {
        return GSAttr.setAsNum(this, 'w-min', val);
    }

    get wMin() {
        return GSAttr.getAsNum(this, 'w-min');
    }

    set hMax(val = '') {
        return GSAttr.setAsNum(this, 'h-max', val);
    }

    get hMax() {
        return GSAttr.getAsNum(this, 'h-max');
    }

    set hMin(val = '') {
        return GSAttr.setAsNum(this, 'h-min', val);
    }

    get hMin() {
        return GSAttr.getAsNum(this, 'h-min');
    }

    close(e) {
        const me = this;
        me.visible = false;
        if (e instanceof Event) {
            e.preventDefault();
            const opt = { type: 'popup', option: e.target, caller: me.#caller, data: null };
            GSEvent.send(me, 'action', opt, true, true);
        }
    }

    open() {
        this.visible = true;
    }

    toggle(e) {
        const me = this;
        if (e) return me.#onPopup(e);
        me.visible = !me.visible;
    }

    /**
     * Show popup at x/y position on the screen
     * @param {number} x 
     * @param {number} y 
     * @returns {void}
     */
    popup(x = 0, y = 0) {
        const me = this;
        const panel = me.#panel;
        if (!panel) return;
        requestAnimationFrame(() => {
            me.visible = true;
            panel.style.top = '0px';
            panel.style.left = '0px';
            me.#resize();
            panel.style.transform = `translate(${x}px, ${y}px)`;
        });

    }

    #resize() {
        const me = this;
        const panel = me.#panel;
        if (!panel) return;
        if (!me.visible) me.style.transform = 'unset';
        if (me.wMax) panel.style.maxWidth = `${me.wMax}px`;
        if (me.wMin) panel.style.minWidth = `${me.wMin}px`;
        if (me.hMax) panel.style.maxHeight = `${me.hMax}px`;
        if (me.hMin) panel.style.minHeight = `${me.hMin}px`;
    }

    #onResize(e) {
        this.close();
    }

    #onPopup(e) {
        const me = this;
        me.#caller = e;
        if (e instanceof Event) {
            e.preventDefault();
            me.#caller = e.composedPath().filter(e => (!(e instanceof HTMLSlotElement)))[0];
        }

        if (me.placement) {
            GSPopper.popupFixed(me.placement, me.#panel, me.#caller);
            me.visible = true;
            return;
        }
        let x = e.clientX, y = e.clientY;
        const rect = me.#panel.getBoundingClientRect();
        const overflowH = x + rect.width > window.innerWidth;
        const overflowV = y + rect.height > window.innerHeight;
        if (overflowH) x = window.innerWidth - rect.width;
        if (overflowV) y = window.innerHeight - rect.height;
        me.popup(x, y);
        return true;
    }

    /**
     * Attach popup to target
     * 
     * @async
     * @returns {Promise}
     */
    async #attachTarget() {
        const me = this;
        if (!me.target) return;
        if (me.#attached) return;
        const targets = GSDOM$1.queryAll(document.documentElement, me.target);
        if (targets.length === 0) {
            if (me.#online) {
                await GSUtil.timeout(1000);
                requestAnimationFrame(() => {
                    me.#attachTarget();
                });
            }
            return;
        }
        me.#attached = true;
        me.event.split(' ').forEach(e => {
            targets.forEach(target => me.attachEvent(target, e, me.#onPopup.bind(me)));
        });
        me.removeEvent(document, 'gs-components');
    }

    #onReady() {
        const me = this;
        me.#attachTarget();
        me.attachEvent(document, 'gs-component', me.#attachTarget.bind(me));
        me.attachEvent(window, 'resize', me.#onResize.bind(me));
        me.#resize();
        if (me.autoclose) me.attachEvent(me.#panel, 'mouseleave', me.close.bind(me));
        if (me.visible) me.popup(me.hPos, me.vPos);
    }

    #onForm(e) {
        const me = this;
        let sts = me.#validateCaller(e, e.target, 'submit', 'GS-POPUP');
        if (!sts) return;
        GSEvent.prevent(e);
        sts = GSEvent.send(me, 'data', { type: 'popup', data: e.detail.data, evt: e }, true, true, true);
        if (sts) me.close();
    }

    #validateCaller(e, own, type, comp) {
        if (e.detail.type !== type) return false;
        const parent = GSComponents$1.getOwner(own, comp);
        return parent == this;
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Process Bootstrap progress component
 * <gs-progress css="" min="0" max="100" value="0"></gs-progress>
 * 
 * @class
 * @extends {GSElement}
 */
class GSProgress extends GSElement {

    static {
        customElements.define('gs-progress', GSProgress);
        Object.seal(GSProgress);
    }

    static get observedAttributes() {
        const attrs = ['min', 'max', 'now'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        const bar = me.#bar;
        if (!bar) return;
        GSAttr.set(bar, `aria-value${name}`, newValue);
        bar.style.width = `${me.percentage}%`;
        if (me.label) GSDOM$1.setHTML(bar, me.#fromLabel());
    }

    #fromLabel() {
        const me = this;
        const opt = { now: me.value, min: me.min, max: me.max, percentage: me.percentage };
        return GSUtil.fromTemplateLiteral(me.label, opt);
    }

    async getTemplate(val = '') {
        const me = this;
        const label = me.label ? GSUtil.fromTemplateLiteral(me.label, { now: me.value, min: me.min, max: me.max, percentage: me.percentage }) : '';
        return `
        <div class="progress" style="${this.getStyle()}">
            <div class="progress-bar ${me.css}" role="progressbar" style="width: ${me.percentage}%" aria-valuenow="${me.value}" aria-valuemin="${me.min}" aria-valuemax="${me.max}">${label}</div>
        </div>    
        `;
    }

    get #bar() {
        return this.query('.progress-bar');
    }

    get isFlat() {
        return true;
    }

    get anchor() {
        return 'self';
    }

    get percentage() {
        const me = this;
        return Math.trunc((me.value / me.max) * 100);
    }

    get value() {
        return GSAttr.getAsNum(this, 'now', 0);
    }

    set value(val = '') {
        if (!GSUtil.isNumber(val)) return false;
        const me = this;
        let v = GSUtil.asNum(val) || me.value;
        if (v > me.max) v = me.max;
        if (v < me.min) v = me.min;
        return GSAttr.set(me, 'now', v);
    }

    get min() {
        return GSAttr.getAsNum(this, 'min', 0);
    }

    set min(val = '') {
        return GSAttr.setAsNum(this, 'min', 0);
    }

    get max() {
        return GSAttr.getAsNum(this, 'max', 100);
    }

    set max(val = '') {
        return GSAttr.setAsNum(this, 'max', 100);
    }

    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get label() {
        return GSAttr.get(this, 'label', '');
    }

    set label(val = '') {
        return GSAttr.set(this, 'label', val);
    }

    increase(val = 1) {
        const me = this;
        me.value = me.value + val;
        return true;
    }

    decrease(val = 1) {
        const me = this;
        me.value = me.value - val;
        return true;
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Renderer for element splitter
 * @class
 * @extends {GSElement}
 */
class GSSplitter extends GSElement {

    #cursor = 0;
    #autostore = false;

    static {
        customElements.define('gs-splitter', GSSplitter);
        Object.seal(GSSplitter);
    }

    constructor() {
        super();
    }

    async getTemplate(val = '') {
        const me = this;
        const size = me.isVertical ? 'width' : 'height';
        const full = me.isVertical ? 'height' : 'width';
        const cursor = me.isVertical ? 'w-resize' : 'n-resize';
        return `
            <style>
                .splitter {
                    ${size}: ${me.size}px;
                    ${full}: 100%;
                    border-width: 1px;
                    cursor: ${cursor};
                    border-color: darkgray;
                    border-style: solid;
                    background-color: lightgray;
                }                        
            </style>
            <div class="splitter ${me.css}" style="${this.getStyle()}"></div>
        `;
    }

    /**
     * Check if splitter use vertical or hotizontal splitting
     * @returns {boolean}
     */
    get isVertical() {
        return GSAttr.get(this, 'split', 'vertical') === 'vertical';
    }

    get css() {
        return GSAttr.get(this, 'css');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    /**
     * Width or height of a splitter in px
     * @returns {number}
     */
    get size() {
        return GSAttr.getAsNum(this, 'size', 8);
    }

    set size(val = '') {
        return GSAttr.setAsNum(this, 'size', val);
    }

    /**
     * Element selection for resizing
     * @returns {string} start|end|top|bottom
     */
    get resize() {
        return GSAttr.get(this, 'resize', 'start');
    }

    set resize(val = '') {
        return GSAttr.set(this, 'resize', val);
    }

    /**
     * Return preceding element
     * @returns {HTMLElement}
     */
    get start() {
        return this.previousElementSibling;
    }

    /**
    * Return following element
    * @returns {HTMLElement}
    */
    get end() {
        return this.nextElementSibling;
    }

    /**
     * Return closest element found
     * @returns {HTMLElement}
     */
    get target() {
        const me = this;
        let el = me.#isPreceeding ? me.start : me.end;
        el = el || me.parentElement;
        el = GSDOM$1.isGSElement(el) ? el.self : el;
        if (el instanceof ShadowRoot) {
            el = Array.from(el.children).filter(o => window.getComputedStyle(o).display !== 'none').pop();
        }
        return el;
    }

    connectedCallback() {
        const me = this;
        me.#autostore = me.id ? true : false;
        super.connectedCallback();
    }

    onReady() {
        const me = this;
        me.#load();
        me.#listen();
        super.onReady();
    }

    get #isPreceeding() {
        const me = this;
        const resize = me.resize;
        return resize === 'start' || resize === 'top';
    }

    get #splitter() {
        return this.query('div');
    }

    #load() {
        const me = this;
        if (!me.#autostore) return;
        const key = GSID.hashCode(location.origin + location.pathname);
        let val = localStorage.getItem(`gs-splitter-${key}-${me.id}`);
        val = GSUtil.asNum(val);
        if (val > 0) {
            me.#cursor = val;
            if (me.isVertical) {
                me.target.style.width = val + "px";
            } else {
                me.target.style.height = val + "px";
            }
        }
    }

    #save() {
        const me = this;
        const style = window.getComputedStyle(me.target);
        const val = me.isVertical ? style.width : style.height;
        const key = GSID.hashCode(location.origin + location.pathname);
        localStorage.setItem(`gs-splitter-${key}-${me.id}`, val.match(/(\d+)/)[0]);
    }

    /**
     * Initial event listener setup.
     * Other events attaches as needed (on click)
     */
    #listen() {
        const me = this;
        const el = me.#splitter;
        me.attachEvent(el, 'mousedown', me.#onMouseDown.bind(me), true);
    }

    /**
    * Starts secondary listeners for mouse move for resizing and mouseup for stopping
    * @param {MouseEvent} e 
    */
    #onMouseDown(e) {
        const me = this;
        GSEvent.prevent(e);
        me.#cursor = me.isVertical ? e.clientX : e.clientY;
        me.attachEvent(document, 'mouseup', me.#onMouseUp.bind(me), true);
        me.attachEvent(document, 'mousemove', me.#onMouseMove.bind(me));
    }

    /**
     * Removes all secondary listeners, and reattach initial listening state
     * @param {MouseEvent} e 
     */
    #onMouseUp(e) {
        const me = this;
        GSEvent.prevent(e);
        GSEvent.deattachListeners(me);
        me.#save();
        me.#listen();
    }


    /**
     * Handles resizing based on mouse move event
     * @param {MouseEvent} e 
     */
    #onMouseMove(e) {
        const me = this;
        GSEvent.prevent(e);
        const pos = me.isVertical ? e.clientX : e.clientY;
        me.#update(pos);
    }

    #update(pos) {
        const me = this;
        requestAnimationFrame(() => {
            if (me.isVertical) {
                me.#updateX(pos);
            } else {
                me.#updateY(pos);
            }
        });
    }

    /**
     * Calculate width based on mouse position
     * @param {number} pos 
     */
    #updateX(pos) {
        const me = this;
        const target = me.target;
        const dir = me.#isPreceeding ? 1 : -1;
        let dx = (pos - me.#cursor) * dir;
        dx = dx + target.clientWidth;
        dx = dx < 0 ? 0 : dx;
        target.style.width = dx + "px";
        me.#cursor = pos;
    }

    /**
     * Calculate height based on mouse position
     * @param {number} pos 
     */
    #updateY(pos) {
        const me = this;
        const target = me.target;
        const dir = me.#isPreceeding ? 1 : -1;
        let dx = (pos - me.#cursor) * dir;
        dx = dx + target.clientHeight;
        dx = dx < 0 ? 0 : dx;
        target.style.height = dx + "px";
        me.#cursor = pos;
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Render tab panel
 * 
 * @class
 * @extends {GSElement}
 */
class GSTab extends GSElement {

  // TAB CONTENT
  static CSS_PANE = '';
  //NAV BAR
  static CSS_NAV = '';
  // NAV ITEM WRAPER
  static CSS_NAV_WRAP = '';

  static {
    customElements.define('gs-tab', GSTab);
    Object.seal(GSTab);
  }

  static get observedAttributes() {
    const attrs = ['data'];
    return GSElement.observeAttributes(attrs);
  }

  constructor() {
    super();
    GSItem.validate(this, this.tagName);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    if (name === 'data') return this.load(newValue);
  }

  async getTemplate(val = '') {
    const me = this;
    const items = GSItem.genericItems(me);
    items.forEach(el => el.id = GSID.id);
    const tabs = items.map(el => me.#renderTab(el)).join('');
    const panes = items.map(el => me.#renderPane(el)).join('');
    const panel = me.#renderPanel(panes);

    const tab = me.#isVertical ? me.#renderTabsVertical(tabs) : me.#renderTabsHorizontal(tabs);
    const css = me.#isVertical ? `d-flex align-items-start ${me.#css}` : me.#css;
    const html = me.#isReverse ? panel + tab : tab + panel;
    return `<div class="${css}">${html}</div>`;
  }

  get #isReverse() {
    return this.#placement === 'end' || this.#placement === 'bottom';
  }

  get #isVertical() {
    return this.#placement === 'start' || this.#placement === 'end';
  }

  // start, end, top , bottom
  get #placement() {
    return GSAttr.get(this, 'placement', 'top');
  }

  get #cssnav() {
    return GSAttr.get(this, 'css-nav', 'nav-tabs');
  }

  get #csspane() {
    return GSAttr.get(this, 'css-pane');
  }

  #renderTabsVertical(tabs) {
    return `
      <div class="nav flex-column user-select-none ${GSTab.CSS_NAV} ${this.#cssnav}" id="v-pills-tab" role="tablist" aria-orientation="vertical">
        ${tabs}
      </div>
    `;
  }

  #renderTabsHorizontal(tabs) {
    return `
      <ul class="nav user-select-none ${GSTab.CSS_NAV} ${this.#cssnav}" "role="tablist">
        ${tabs}
      </ul>      
      `;
  }

  #renderPanel(panes) {
    return `     
        <div class="tab-content flex-fill ${GSTab.CSS_PANE} ${this.#csspane}">
          ${panes}
        </div>  
      `;
  }

  #renderTab(el) {
    const me = this;
    const wrap = me.#isVertical ? '' : `<li class="nav-item ${GSTab.CSS_NAV_WRAP} ${me.#cssNavWrap(el)}" role="presentation">`;
    const title = me.#title(el);
    const icon = me.#icon(el);
    const iconTpl = icon ? `<i class="${icon}"></i>` : '';
    //const contentTpl = me.rtl ? `${title} ${iconTpl}` : `${iconTpl} ${title}`;
    const contentTpl = `${iconTpl} ${title}`;

    const actievCSS = me.#activeTabCSS(el);

    return `${wrap}
          <a type="button" role="tab" is="gs-ext-navlink"
              id="${el.id}-tab" 
              class="nav-link ${me.#cssNav(el)} ${actievCSS}" 
              aria-controls="${el.id}-tab"                 
              data-bs-target="#${el.id}-pane" 
              data-bs-toggle="tab">${contentTpl}</a>
          ${wrap ? '</li>' : ''}
      `;
  }

  #renderPane(el) {
    const me = this;
    return me.isFlat ? me.#renderPaneFlat(el) : me.#renderPaneShadow(el);
  }

  #renderPaneShadow(el) {
    const me = this;
    const actievCSS = me.#activePaneCSS(el);
    const body = GSItem.getBody(el);
    const slot = GSDOM$1.parseWrapped(me, body);
    GSAttr.set(slot, 'slot', el.id);
    GSDOM$1.appendChild(me, slot);
    return `
      <div  id="${el.id}-pane" aria-labelledby="${el.id}-tab" 
          class="tab-pane fade ${me.#cssPane(el)}  ${actievCSS}" 
          role="tabpanel">
          <slot name="${el.id}"></slot>
      </div>        
      `;
  }

  #renderPaneFlat(el) {
    const me = this;
    const actievCSS = me.#activePaneCSS(el);
    const body = GSItem.getBody(el, me.isFlat);
    return `
      <div  id="${el.id}-pane" aria-labelledby="${el.id}-tab" 
          class="tab-pane fade ${me.#cssPane(el)}  ${actievCSS}" 
          role="tabpanel">
          ${body}
      </div>        
      `;
  }

  #active(el) {
    return GSAttr.getAsBool(el, 'active');
  }

  #activeTabCSS(el) {
    return this.#active(el) ? 'active' : '';
  }

  #activePaneCSS(el) {
    return this.#active(el) ? 'active show' : '';
  }

  #title(el) {
    return GSAttr.get(el, 'title');
  }

  #icon(el) {
    return GSAttr.get(el, 'icon');
  }

  #cssPane(el) {
    return GSAttr.get(el, 'css-pane');
  }

  #cssNav(el) {
    return GSAttr.get(el, 'css-nav');
  }

  #cssNavWrap(el) {
    return GSAttr.get(el, 'css-nav-wrap');
  }

  get #css() {
    return GSAttr.get(this, 'css', '');
  }

  /**
   * Load data from various sources
   * 
   * @async
   * @param {JSON|func|url} val 
   * @returns {Promise}
   */
  async load(val = '') {
    const data = await GSLoader.loadData(val);
    if (!GSUtil.isJsonType(data)) return;
    const me = this;
    const src = GSItem.generateItem(data);
    GSDOM$1.setHTML(me, src);
    GSEvent.deattachListeners(me);
    me.connectedCallback();
  }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Process Bootstrap tooltip efinition
 * <gs-tooltip placement="top" ref="#el_id" title="xxxxxx"></gs-tooltip>
 * 
 * @class
 * @extends {GSElement}
 */
class GSTooltip extends GSElement {

    static {
        customElements.define('gs-tooltip', GSTooltip);
        Object.seal(GSTooltip);
        GSDOMObserver.registerFilter(GSTooltip.#onMonitorFilter, GSTooltip.#onMonitorResult);
    }

    /**
     * Filter function for monitor observer
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #onMonitorFilter(el) {
        if (!(el instanceof HTMLElement)) return false;
        if (el.tagName && el.tagName.startsWith('GS-')) return false;
        return GSTooltip.#isTooltip(el) && !GSTooltip.#hasTooltip(el);
    }

    /**
     * Function to attach gstooltip to the element
     * @param {HTMLElement} el 
     */
    static #onMonitorResult(el) {
        el.id = el.id || GSID.id;
        const tooltip = document.createElement('gs-tooltip');
        tooltip.ref = `#${el.id}`;
        requestAnimationFrame(() => {
            setTimeout(() => {
                el.parentElement.insertAdjacentElement('beforeend', tooltip);
            }, 100);
        });
    }

    constructor() {
        super();
    }

    onReady() {
        const me = this;
        super.onReady();
        me.#attachEvents();
    }

    // https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
    #attachEvents() {
        const me = this;
        me.attachEvent(me.target, 'mouseenter', me.show.bind(me));
        me.attachEvent(me.target, 'mouseleave', me.hide.bind(me));
    }

    #popup() {
        const me = this;
        const arrowEl = me.querySelector('div.tooltip-arrow');
        GSPopper.popupFixed(me.placement, me.firstElementChild, me.target, arrowEl);
        return me.firstElementChild;
    }

    get #html() {
        const me = this;
        return `
         <div class="tooltip bs-tooltip-auto fade " data-popper-placement="${me.placement}" role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner">${me.title}</div>
        </div>        
        `;
    }

    get target() {
        const me = this;
        if (me.ref) {
            let owner = me.owner;
            owner = GSDOM$1.isGSElement(me.owner) ? owner.self : owner;
            return owner.querySelector(me.ref);
        }
        return me.previousElementSibling || me.parentElement;
    }

    get ref() {
        const me = this;
        return GSAttr.get(me, 'ref');
    }

    set ref(val = '') {
        return GSAttr.set(this, 'ref', val);
    }

    get title() {
        const me = this;
        return GSAttr.get(me, 'title') || GSAttr.get(me.target, 'title');
    }

    set title(val = '') {
        const me = this;
        return GSAttr.set(me, 'title', val);
    }

    get placement() {
        const me = this;
        return GSAttr.get(me, 'placement', me.target?.dataset?.bsPlacement || 'top');
    }

    set placement(val = '') {
        return GSAttr.set(this, 'placement', val);
    }

    get isFlat() {
        return true;
    }

    /**
     * Show tooltip
     */
    show() {
        const me = this;
        requestAnimationFrame(() => {
            const el = GSDOM$1.parse(me.#html, true);
            me.insertAdjacentElement('afterbegin', el);
            me.#popup();
            GSDOM$1.toggleClass(me.firstElementChild, 'show', true);
        });
    }

    /**
     * Hide tooltip
     */
    hide() {
        const me = this;
        setTimeout(() => {
            // GSDOM.setHTML(me, '');
            // me.firstChild?.remove();
            Array.from(me.childNodes).forEach(el => el.remove());
        }, 250);
        return GSDOM$1.toggleClass(me.firstElementChild, 'show', false);
    }

    /**
     * Toggle tooltip on/off
     */
    toggle() {
        const me = this;
        me.childElementCount > 0 ? me.hide() : me.show();
    }

    /**
     * Check if element has attached tooltip
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #hasTooltip(el) {
        return (el?.firstElementChild || el?.nextElementSibling) instanceof GSTooltip;
    }

    /**
     * Check if standard element is tooltip defined
     * @param {HTMLElement} el 
     * @returns {boolean} 
     */
    static #isTooltip(el) {
        return el?.title && el?.dataset?.bsToggle === 'tooltip';
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSAttachment class
 * @module components/filebox/GSAttachment
 */

/**
 * Handles DataFileTransfer object
 * @class
 */
class GSAttachment {

    constructor(file, directory) {
        this.file = file;
        this.directory = directory;
    }

    static traverse(transfer, directory) {
        return GSAttachment.#transferredFiles(transfer, directory);
    }

    static from(files) {
        return Array.from(files).filter(f => f instanceof File).map(f => new GSAttachment(f));
    }

    get fullPath() {
        const me = this;
        return me.directory ? `${me.directory}/${me.file.name}` : me.file.name;
    }

    isImage() {
        return ['image/gif', 'image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'].includes(this.file.type);
    }

    isVideo() {
        return ['video/mp4', 'video/quicktime'].includes(this.file.type);
    }

    static #transferredFiles(transfer, directory) {
        if (directory && GSAttachment.#isDirectory(transfer)) {
            return GSAttachment.#traverse('', GSAttachment.#roots(transfer));
        }
        return Promise.resolve(GSAttachment.#visible(Array.from(transfer.files || [])).map(f => new GSAttachment(f)));
    }

    static #hidden(file) {
        return file.name.startsWith('.');
    }

    static #visible(files) {
        return Array.from(files).filter(file => !GSAttachment.#hidden(file));
    }

    static #getFile(entry) {
        return new Promise(function (resolve, reject) {
            entry.file(resolve, reject);
        });
    }

    static #getEntries(entry) {
        return new Promise(function (resolve, reject) {
            const result = [];
            const reader = entry.createReader();
            const read = () => {
                reader.readEntries(entries => {
                    if (entries.length > 0) {
                        result.push(...entries);
                        read();
                    } else {
                        resolve(result);
                    }
                }, reject);
            };
            read();
        });
    }

    static async #traverse(path, entries) {
        const results = [];
        for (const entry of GSAttachment.#visible(entries)) {
            if (entry.isDirectory) {
                const entries = await GSAttachment.#getEntries(entry);
                const list = await GSAttachment.#traverse(entry.fullPath, entries);
                results.push(...(list));
            } else {
                const file = await GSAttachment.#getFile(entry);
                results.push(new GSAttachment(file, path));
            }
        }
        return results;
    }

    static #isDirectory(transfer) {
        return Array.from(transfer.items).some((item) => {
            const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
            return entry && entry.isDirectory;
        });
    }

    static #roots(transfer) {
        return Array.from(transfer.items)
            .map((item) => item.webkitGetAsEntry())
            .filter(entry => entry != null);
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * File box allows drag-n-drop fiels for upload
 * <gs-filebox id="other" multiple="true" directory="true" elid="test"></gs-filebox>
 * Use event listener to return false for file access filtering
 * @class
 * @extends {GSElement}
 */
class GSFileBox extends GSElement {

    static TITLE = 'Drop file/s here or click to select';
    static CSS = 'border-2 p-4 d-block text-center dash';

    #dragging = null;

    constructor() {
        super();
        //me.style.setProperty('border-style', 'dashed', 'important');
        //GSDOM.toggleClass(me, GSFileBox.CSS, true);
    }

    async getTemplate(val = '') {
        const me = this;
        return `<style>
            .dash {
                border-style: var(--gs-fieldbox-border, dashed) !important;
                border-color: var(--gs-fieldbox-border-color, lightgrey);
            }
            input[type=file] {
                color : var(--gs-fieldbox-color, transparent);
            } 
            input[type=file]::file-selector-button {

            }             
            input[type=file]::file-selector-button:hover {
            }            
        </style>
        <div part="border" class="${me.css}">
            <label part="label" class="${me.cssLabel}" for="${me.name}">${me.title}</label>
            <input part="input" class="${me.cssInput}" type="file" accept="${me.accept}" id="${me.name}" name="${me.name}" ${me.multiple ? "multiple" : ""} ${me.directory ? "directory webkitdirectory" : ""} >
            <pre part="list" class="${me.cssList}"></pre>
        </div>
        `
    }

    onReady() {
        const me = this;
        const target = me.query('div'); // me.isFlat ? me.query('div') : me;
        me.attachEvent(target, 'click', me.#onClick.bind(me));
        me.attachEvent(target, 'dragenter', me.#onDragenter.bind(me));
        me.attachEvent(target, 'dragover', me.#onDragenter.bind(me));
        me.attachEvent(target, 'dragleave', me.#onDragleave.bind(me));
        me.attachEvent(target, 'drop', me.#onDrop.bind(me));
        me.attachEvent(target, 'paste', me.#onPaste.bind(me));
        me.attachEvent(target, 'change', me.#onChange.bind(me));
        super.onReady();
    }

    get listEl() {
        return this.query('pre');
    }

    get fileEl() {
        return this.query('input');
    }

    /**
     * CSS for filebox frame
     */
    get css() {
        return GSAttr.get(this, 'css', GSFileBox.CSS);
    }

    set css(val = '') {
        return GSAttr.set(this, 'css');
    }

    /**
    * CSS for text list of selected files
    */
    get cssList() {
        return GSAttr.get(this, 'css-list', '');
    }

    set cssList(val = '') {
        return GSAttr.set(this, 'css-list');
    }

    /**
     * CSS for filebox info message
     */
    get cssLabel() {
        return GSAttr.get(this, 'css-label', '');
    }

    set cssLabel(val = '') {
        return GSAttr.set(this, 'css-label');
    }

    /**
     * CSS for filebox input element
     */
    get cssInput() {
        return GSAttr.get(this, 'css-input', 'd-none');
    }

    set cssInput(val = '') {
        return GSAttr.set(this, 'css-input');
    }

    /**
     * Set to true to enable multiple file or directory selection
     */
    get multiple() {
        return GSAttr.getAsBool(this, 'multiple', true);
    }

    set multiple(val = '') {
        return GSAttr.setAsBool(this, 'mulltiple', val);
    }

    /**
     * Filebox info message 
     */
    get title() {
        return GSAttr.get(this, 'title', GSFileBox.TITLE);
    }

    set title(val = '') {
        return GSAttr.set(this, 'title', GSFileBox.TITLE);
    }

    /**
     * Input field name and id
     */
    get name() {
        return GSAttr.get(this, 'name', '');
    }

    set name(val = '') {
        return GSAttr.set(this, 'name', '');
    }

    get accept() {
        return GSAttr.get(this, 'accept', '');
    }

    set accept(val = '') {
        return GSAttr.set(this, 'accept');
    }

    /**
     * Regex for paste accept 
     */
    get filter() {
        return GSAttr.get(this, 'filter', '^image\/(gif|png|jpeg)$');
    }

    set filter(val = '') {
        return GSAttr.set(this, 'filter');
    }

    get directory() {
        return GSAttr.getAsBool(this, 'directory', false);
    }

    set directory(value = '') {
        return GSAttr.setAsBool(this, 'directory', val);
    }

    #onClick(e) {
        if (e.target instanceof HTMLLabelElement) return;
        const label = this.fileEl.previousElementSibling;
        if (label instanceof HTMLLabelElement) label.click();
    }

    #onDragenter(e) {
        const me = this;
        if (me.#dragging) clearTimeout(me.#dragging);
        me.#dragging = setTimeout(() => me.removeAttribute('hover'), 200);
        const transfer = e.dataTransfer;
        if (!transfer || !me.#hasFile(transfer)) return;
        transfer.dropEffect = 'copy';
        me.setAttribute('hover', '');
        e.preventDefault();
    }

    #onDragleave(e) {
        const me = this;
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
        me.removeAttribute('hover');
        GSEvent.prevent(e);
    }

    #onDrop(e) {
        const me = this;
        me.removeAttribute('hover');
        const transfer = e.dataTransfer;
        if (!transfer || !me.#hasFile(transfer)) return;
        me.#attach(transfer);
        GSEvent.prevent(e);
    }

    #onPaste(e) {
        const me = this;
        if (!e.clipboardData) return;
        if (!e.clipboardData.items) return;
        const file = me.#pastedFile(e.clipboardData.items);
        if (!file) return;
        const files = [file];
        me.#attach(files);
        e.preventDefault();
    }

    #onChange(e) {
        const me = this;
        const input = me.fileEl;
        const files = input.files;
        if (!files || files.length === 0) return;
        me.#attach(files);
        // input.value = '';
    }

    #hasFile(transfer) {
        return Array.from(transfer.types).indexOf('Files') >= 0;
    }

    #pastedFile(items) {
        const me = this;
        const rgx = me.filter ? new RegExp(me.filter) : null;
        for (const item of items) {
            if (item.kind === 'file') {
                if (!rgx) return item.getAsFile();
                if (rgx.test(item.type)) return item.getAsFile();
            }
        }
        return null;
    }

    #accept(attachments) {
        const me = this;
        const dataTransfer = new DataTransfer();
        attachments.forEach(a => dataTransfer.items.add(a.file));
        me.fileEl.files = dataTransfer.files;
        me.listEl.textContent = attachments.map(a => a.file.name).join('\n');
    }

    async #attach(transferred) {
        const me = this;
        const isDataTfr = transferred instanceof DataTransfer;
        const attachments = isDataTfr
            ? await GSAttachment.traverse(transferred, me.directory)
            : GSAttachment.from(transferred);

        const accepted = GSEvent.send(me, 'accept', { attachments }, true, false, true);
        if (accepted && attachments.length) {
            me.#accept(attachments);
            GSEvent.send(me, 'accepted', { attachments }, true);
        }
    }

    static {
        customElements.define('gs-filebox', GSFileBox);
        Object.seal(GSFileBox);
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Table data handler, pager, loader
 * @class
 * @extends {HTMLElement}
 */
class GSStore extends HTMLElement {

    static #MODES = ['rest', 'query', 'quark'];
    #online = false;
    #src = '';
    #data = [];

    #remote = false;
    #skip = 0;
    #limit = 0;
    #page = 1;

    #sort = [];
    #filter = [];
    #total = 0;

    static {
        customElements.define('gs-store', GSStore);
        Object.seal(GSStore);
    }

    static get observedAttributes() {
        return ['id', 'src', 'limit', 'skip', 'remote', 'filter', 'sort'];
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    attributeChangedCallback(name = '', oldValue = '', newValue = '') {
        const me = this;

        if (name === 'id') {
            GSComponents$1.remove(oldValue);
            GSComponents$1.store(me);
            return;
        }

        if (GSComponents$1.hasSetter(me, name)) {
            me[name] = newValue;
        }

        if (name === 'src') {
            me.#data = [];
            me.reload();
        }

    }

    /*
     * Called when element injected to parent DOM node
     */
    connectedCallback() {
        const me = this;
        me.#online = true;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSComponents$1.store(me);
    }

    /*
     * Called when element removed from parent DOM node
     */
    disconnectedCallback() {
        const me = this;
        me.#online = false;
        GSComponents$1.remove(me);
    }

    /**
     * Wait for event to happen
     * 
     * @async
     * @param {*} name 
     * @returns {Promise<void>}
     */
    async waitEvent(name = '') {
        if (!name) throw new Error('Event undefined!');
        const me = this;
        return new Promise((r, e) => {
            me.once(name, (evt) => r(evt.detail));
        });
    }

    /**
     * Listen once for triggered event
     * 
     * @param {*} name 
     * @param {*} func 
     */
    once(name, func) {
        return this.attachEvent(this, name, func, true);
    }

    /**
     * Attach event to this element
     * 
     * @param {*} name 
     * @param {*} func 
     */
    listen(name, func) {
        return this.attachEvent(this, name, func);
    }

    /**
     * Remove event from this element
     * 
     * @param {*} name 
     * @param {*} func 
     */
    unlisten(name, func) {
        this.removeEvent(this, name, func);
    }

    /**
    * Generic event listener appender
    * TODO handle once events to self remove
    * TODO handle fucntion key override with same function signature dif instance
    */
    attachEvent(el, name = '', fn, once = false) {
        return GSEvent.attach(this, el, name, fn, once);
    }

    /**
    * Generic event listener remover
    */
    removeEvent(el, name = '', fn) {
        GSEvent.remove(this, el, name, fn);
    }

    /**
     * HTTP operational mode
     * rest, query, quark 
     */
    get mode() {
        const mode = GSAttr.get(this, 'mode', 'query');
        const isok = GSStore.#MODES.includes(mode);
        return isok ? mode : 'query';
    }

    set mode(val = 'query') {
        const isok = GSStore.#MODES.includes(val);
        if (isok) return GSAttr.set(this, 'mode', val);
        console.log(`Invalid mode, allowed: ${GSStore.#MODES}`);
    }

    /**
     * Call for defined mode
     * - quark - JSON path to CRUD object; ie. io.greenscreens.CRUD
     * - rest - url rest format, ie. /${limit}/${skip}?sort=${sort}&filter=${filter}
     * - query - url format, ie. ?limit=${limit}&skip=${skip}&sort=${sort}&filter=${filter}
     */
    get action() {
        const me = this;
        let def = '';
        switch (me.mode) {
            case 'query':
                def = '?limit=${limit}&skip=${skip}&sort=${sort}&filter=${filter}';
                break;
            case 'rest':
                def = '/${limit}/${skip}?sort=${sort}&filter=${filter}';
                break;
        }
        return GSAttr.get(me, 'action', def);
    }

    get table() {
        return GSDOM$1.closest(this, 'GS-TABLE')
    }

    /**
     * Generate URL from src and mode type
     */
    get url() {
        const me = this;
        return me.#toURL(me.src, me.skip, me.limit, me.filter, me.sort);
    }

    /**
     * Table data url (JSON)
     */
    get src() {
        return this.#src;
    }

    set src(val = '') {
        const me = this;
        me.#src = val;
        me.reload();
    }

    get limit() {
        return this.#limit;
    }

    set limit(val = 0) {
        const me = this;
        me.#limit = GSUtil.asNum(val);
        me.reload();
    }

    get skip() {
        return this.#skip;
    }

    set skip(val = 0) {
        const me = this;
        me.#skip = GSUtil.asNum(val);
        me.reload();
    }

    /**
     * if true, on every request data is loded from remote
     * if false, data is loaded once and cached
     */
    get remote() {
        return this.#remote;
    }

    set remote(val = false) {
        const me = this;
        me.#remote = GSUtil.asBool(val);
        me.reload();
    }

    /**
     * Filter data in format 
     * [{name: idx[num] || name[string], value: ''  , op:'eq'}]
     */
    get filter() {
        return this.#filter;
    }

    set filter(val) {
        const me = this;
        me.#filter = GSUtil.isJson(val) ? GSUtil.toJson(val) : val;
        me.reload();
    }

    /**
     * Sort data in format
     * [{col: idx[num] || name[string]  , op: -1 | 1 }]
     */
    get sort() {
        return this.#sort;
    }

    set sort(val) {
        const me = this;
        me.#sort = GSUtil.isString(val) ? JSON.parse(val) : val;
        me.reload();
    }

    /**
     * Currently loaded data
     */
    get data() {
        return this.#data;
    }

    get total() {
        return this.#total || this.#data.length;
    }

    get offset() {
        const me = this;
        return (me.page - 1) * me.limit;
    }

    /**
     * Current page
     */
    get page() {
        return this.#page;
    }

    set page(val = 1) {
        if (!GSUtil.isNumber(val)) throw new Error('Numeric value required!');
        const me = this;
        me.#page = GSUtil.asNum(val < 1 ? 1 : val);
        me.#page = me.#page > me.pages ? me.pages : me.#page;
        const skip = me.#limit * (val - 1);
        me.getData(skip, me.#limit, me.#filter, me.#sort);
    }

    /**
     * Total pages
     */
    get pages() {
        const me = this;
        if (me.total === 0) return 1;
        return me.limit === 0 ? 1 : Math.ceil(me.total / me.#limit);
    }

    nextPage() {
        const me = this;
        if (me.page === me.pages) return;
        me.page = me.page + 1;
        return me.#page;
    }

    prevPage() {
        const me = this;
        if (me.page === 1) return;
        me.page = me.page - 1;
        return me.#page;
    }

    lastPage() {
        const me = this;
        me.page = me.#limit === 0 ? 1 : me.pages;
        return me.#page;
    }

    firstPage() {
        const me = this;
        me.page = 1;
        return me.#page;
    }

    clear() {
        const me = this;
        me.#total = 0;
        me.setData();
    }

    async load(val, opt) {
        const me = this;
        if (!me.#online) return false;
        const url = val || me.src;
        if (url.length === 0) return false;
        opt = opt || {};
        opt.headers = opt.headers || {};
        opt.headers['Content-Type'] = 'application/json; utf-8';
        opt.headers.Accept = 'application/json';
        const res = await fetch(url, opt);
        if (!res.ok) return false;
        const data = await res.json();
        me.#update(data);
        return data;
    }

    #update(data = [], append = false) {

        const me = this;
        
        let records = [];
        if (Array.isArray(data)) {
            records = data;
        } else if (Array.isArray(data.data)) {
            records = data.data;
        } else {
            records = [data];
        }

        if (append) {
            me.#data = me.#data.concat(records);
        } else {
            me.#page = 1;
            me.#data = records;
        }
        
        me.#total = me.#data.length;
    }

    setData(data = [], append = false) {
        const me = this;
        me.#update(data, append);
        me.getData(me.skip, me.limit, me.#filter, me.#sort);
    }

    async getData(skip = 0, limit = 0, filter, sort) {
        const me = this;
        filter = me.#formatFilter(filter || me.filter);
        sort = me.#formatSort(sort || me.sort);
        let data = [];

        const simple = GSUtil.isString(filter) && GSUtil.isStringNonEmpty(filter);

        if (!simple && me.src && (me.remote || me.data.length == 0)) {
            const url = me.#toURL(me.src, skip, limit, filter, sort);
            data = await me.load(url);
        }

        if (!me.remote) {
            const fields = me.#fields();
            data = GSData.filterData(filter, me.#data, fields);
            data = GSData.sortData(sort, data);
            limit = limit === 0 ? data.length : limit;
            data = data.slice(skip, skip + limit);
        }

        me.#notify('data', data);
        return data;
    }

    reload() {
        const me = this;
        if (!me.#online) return;
        return me.getData(me.skip, me.limit, me.filter, me.sort);
    }

    #toURL(src, skip, limit, filter, sort) {
        const me = this;
        sort = sort ? JSON.stringify(sort) : '';
        filter = filter ? JSON.stringify(filter) : '';
        const opt = { limit: limit, skip: skip, sort: encodeURIComponent(sort), filter: encodeURIComponent(filter) };
        return src + GSUtil.fromLiteral(me.action, opt);
    }

    #notify(name = 'data', data) {
        GSEvent.sendDelayed(1, this, name, data, true);
    }

    #formatFilter(val) {
        let filter = [];

        if (typeof val === 'string') {
            filter = val;
        } else if (Array.isArray(val)) {
            filter = val;
        }
        return filter;
    }

    #formatSort(val = '') {
        let sort = undefined;
        if (typeof val === 'string') {
            sort = [{ col: val }];
        } else if (Array.isArray(val)) {
            sort = val;
        } else if (GSUtil.isNumber(val)) {
            const idx = Math.abs(val);
            sort = new Array(idx);
            sort[idx - 1] = { ord: val };
        }
        return sort;
    }

    #fields() {
        const me = this;
        const fields = me.table?.header?.fields;
        return fields ? fields : Array.from(me.querySelectorAll('gs-item')).map(o => o.name);
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Table column renderer for GSTable
 * @class
 * @extends {HTMLElement}
 */
class GSColumn extends HTMLElement {

    static {
        customElements.define('gs-column', GSColumn);
    }

    #map = [];

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    connectedCallback() {
        this.#loadMap();
    }

    async #loadMap() {
        const me = this;
        const data = await GSLoader.loadSafe(me.src, 'GET', null, true);
        me.#map = Array.isArray(data) ? data : Object.entries(data);
    }

    render() {
        const me = this;

        const clssort = me.sortable ? 'sorting' : '';
        const style = me.width ? `style="width:${me.width};"` : '';
        const cspan = me.colspan ? `colspan="${me.colspan}"` : '';

        return `<th scope="col" data-sortable="${me.sortable}" data-order="${me.#orderID}" name="${me.name}" ${cspan} class="${clssort} ${me.cssHeader}" ${style}>${me.title || me.name}</th>`;
    }

    renderFilter() {
        const me = this;
        if (!me.filter) return '<th></th>';
        let html = '';
        switch (me.list) {
            case 'fixed':
                html = me.#renderFixed();
                break;
            case 'flexi':
                html = me.#renderFlexi();
                break;
            default:
                html = me.#renderField();
        }
        return `<th css="${me.cssFilter}">${html}</th>`;
    }

    #renderFixed() {
        const me = this;
        const opts = me.#renderOptions(true);
        return `<select auto="${me.auto}" name="${me.name}" title="${me.title || me.name}" class="${me.cssField}" >${opts}</select>`;
    }

    #renderFlexi() {
        const me = this;
        const id = GSID.next();
        const html = me.#renderField(id);
        const opts = me.#renderOptions(false);
        const list = `<datalist id="${id}">${opts}</datalist>`;
        return html + list;
    }

    #renderField(list = '') {
        const me = this;
        return `<input auto="${me.auto}" name="${me.name}" title="${me.title || me.name}" class="${me.cssField}" placeholder="${me.title || me.name}" list="${list}">`;
    }

    #renderOptions(isCombo = false) {
        const me = this;
        const list = [];
        me.filters.forEach(el => {
            const def = GSAttr.getAsBool(el, 'default', false);
            const value = GSAttr.get(el, 'value', '');
            const title = GSAttr.get(el, 'map', value);
            let html = '';
            if (isCombo) {
                html = `<option value="${value}" ${def ? 'selected' : ''}>${title}</option>`;
            } else {
                html = `<option value="${title}" data-value="${value}">`;
            }
            list.push(html);
        });
        return list.join('');
    }

    get #orderID() {
        const me = this;
        if(me.sortable && me.direction) return me.direction === 'asc' ? 1 : -1;
        return 0;
    }

    get table() {
        return GSDOM$1.closest(this, 'GS-TABLE');
    }

    get cssField() {
        const me = this;
        const def = me.list ? 'form-select' : 'form-control';
        return GSAttr.get(me, 'css-field', def);
    }

    get filter() {
        return GSAttr.getAsBool(this, 'filter', false);
    }

    get sortable() {
        const me = this;
        return me.name && !me.counter ? GSAttr.getAsBool(me, 'sortable', true) : false;
    }

    get direction() {
        const me = this;
        return GSAttr.get(me, 'direction', '');
    }

    get cssFilter() {
        return GSAttr.get(this, 'css-filter', '');
    }

    get cssHeader() {
        return GSAttr.get(this, 'css-header', 'border-end');
    }

    get css() {
        return GSAttr.get(this, 'css', '');
    }

    get width() {
        return GSAttr.get(this, 'width');
    }

    get name() {
        return GSAttr.get(this, 'name', '');
    }

    get title() {
        return GSAttr.get(this, 'title', '');
    }

    get counter() {
        return this.name === '#';
    }

    get index() {
        return GSAttr.getAsNum(this, 'index', -1);
    }

    get format() {
        return GSAttr.get(this, 'format');
    }

    get type() {
        return GSAttr.get(this, 'type');
    }

    get colspan() {
        return GSAttr.get(this, 'colspan', '');
    }

    /**
     * Will generate ComboBox or datalist
     */
    get list() {
        const me = this;
        const val = GSAttr.get(me, 'list', '').toLowerCase();
        const isValid = ['fixed', 'flexi'].includes(val);
        if (!isValid && !me.auto) return 'flexi';
        return isValid ? val : '';
    }

    get items() {
        return GSItem.genericItems(this);
    }

    get filterDef() {
        return this.querySelector('gs-item[filter="true"]');
    }

    get mapDef() {
        return this.querySelector('gs-item[map="true"]');
    }

    get ref() {
        return GSAttr.get(this.mapDef, 'ref');
    }

    get src() {
        return GSAttr.get(this.mapDef, 'src');
    }

    get filters() {
        return GSItem.genericItems(this.filterDef);
    }

    get maps() {
        return GSItem.genericItems(this.mapDef);
    }

    /**
     * Is auto populate list with data values
     */
    get auto() {
        return this.childElementCount === 0;
    }

    get #mapping() {
        const me = this;
        if (me.src) return me.#map;
        if (me.#map.length === 0) me.#map =  me.maps.map(el => [GSAttr.get(el, 'value'), GSAttr.get(el, 'map')]);
        return me.#map;
    }

    toJSON() {
        const me = this;
        // [[val,map]]
        return {
            ref : me.ref,
            name: me.name,
            title: me.title,
            width: me.width,
            sortable: me.sortable,
            filter: me.filter,
            idx: me.index,
            type: me.type,
            format: me.format,
            css: me.css,
            colspan: me.colspan,
            map: me.#mapping
        };
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Table header renderer for GSTable
 * @class
 * @extends {HTMLElement}
 */
class GSHeader extends HTMLElement {

    static {
        customElements.define('gs-header', GSHeader);
    }

    get #columns() {
        return GSDOM$1.queryAll(this, 'gs-column');
    }

    get #filtered() {
        return GSDOM$1.queryAll(this, 'gs-column[filter=true]');
    }

    get #available() {
        return GSDOM$1.queryAll(this, 'gs-column').filter(el => GSAttr.get(el, 'hidden', 'false') === 'false');
    }

    render() {
        const me = this;

        const table = me.table;
        const filters = me.#filtered;
        const columns = me.#available;

        const html = [];
        html.push(`<thead class="${table.cssHeader}">`);

        if (filters.length > 0) {
            html.push(`<tr is="gs-tablefilter" class="${table.cssFilter}">`);
            me.#columns.forEach(el => html.push(el.renderFilter()));
            html.push('</tr>');
        }

        html.push(`<tr is="gs-tablesort" class="${table.cssColumns}">`);
        columns.forEach(el => html.push(el.render()));
        html.push('</tr>');

        html.push('</thead>');
        return html.join('');
    }

    toJSON() {
        const me = this;
        const cols = me.#available;
        return cols.map(el => el.toJSON());
    }

    get table() {
        return GSDOM$1.closest(this, 'GS-TABLE')
    }

    get fields() {
        const me = this;
        const cols = me.#available;
        return cols.map(el => GSAttr.get(el, 'name'));

    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Bootstrap table bod renderer
 * <tbody is="gs-tbody"></tbody>
 * @class
 * @extends {HTMLTableSectionElement}
 */
class GSTBody extends HTMLTableSectionElement {

    #table = null;

    static {
        customElements.define('gs-tbody', GSTBody, { extends: 'tbody' });
        Object.seal(GSTBody);
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSEvent.attach(me, me, 'click', e => me.#onClick(e));
        GSEvent.attach(me, me, 'contextmenu', e => me.#onMenu(e), false, true);
        me.#table = GSDOM$1.closest(me, 'GS-TABLE');
    }

    disconnectedCallback() {
        const me = this;
        me.#table = null;
        GSEvent.deattachListeners(me);
    }

    get index() {
        return this.table.index;
    }

    get cssCell() {
        return this.table.cssCell;
    }

    get cssRow() {
        return this.table.cssRow;
    }

    get cssSelect() {
        return this.table.cssSelect;
    }

    get select() {
        return this.table.select;
    }

    get multiselect() {
        return this.table.multiselect;
    }

    get table() {
        return this.#table || GSDOM$1.closest(this, 'GS-TABLE');
    }

    render(headers, data, offset) {

        const me = this;
        if (!Array.isArray(headers)) return;

        const rows = [];
        let html = '';

        data.forEach((rec, idx) => {
            rows.push(`<tr class="${me.cssRow}" data-index=${idx}>`);

            if (Array.isArray(rec)) {
                html = me.#arrayToHTML(headers, rec, idx, offset);
            } else {
                html = me.#objToHTML(headers, rec, offset);
            }

            rows.push(html);
            rows.push('</tr>');
        });

        if (data.length === 0 && me.table.noDataText) {
            const cspan = headers.map(o => o.colspan ? parseInt(o.colspan) | 1 : 1).reduce((a, b) => a + b, 0);
            rows.push(me.#emptyRow(cspan));
        }


        GSDOM$1.setHTML(me, rows.join(''));
        GSDOM$1.queryAll(me, 'tr').forEach(el => { if (el.innerText.trim().length === 0) el.remove(); });
    }

    #emptyRow(cols) {
        return `<tr data-ignore="true"><td colspan="${cols}" class="text-center fw-bold text-muted">${this.table.noDataText}</td></tr>`;
    }

    #arrayToHTML(headers, rec, idx, offset) {
        const me = this;
        const cols = [];
        headers.forEach(hdr => {
            const c = hdr.name === "#" ? (idx + 1 + offset).toString() : rec[hdr.idx];
            cols.push(`<td class="${me.cssCell}">${c || '&nbsp;'}</td>`);

        });

        return cols.join('');
    }

    #objToHTML(headers, rec, offset) {
        const me = this;
        const cols = [];
        headers.forEach((hdr, i) => {
            const html = me.#genRow(hdr, rec, i + 1 + offset);
            cols.push(html);
        });
        return cols.join('');
    }

    #genRow(hdr, rec, idx) {
        const me = this;
        let val = hdr.name === "#" ? idx : rec[hdr.name];
        let ref = hdr.ref ? rec[hdr.ref] : val;
        const map = hdr.map?.filter(o => o[0] === '' + ref);
        val = map?.length > 0 ? map[0][1] || val : val;
        val = me.#format(hdr, val);
        const cspan = hdr.colspan ? `colspan="${hdr.colspan}"` : '';
        // todo format data 
        return `<td class="${me.cssCell} ${hdr.css}" ${cspan}>${val?.toString() || '&nbsp;'}</td>`;
    }

    #format(hdr, val) {

        if (!hdr.format) return val;

        const type = this.#toType(hdr, val);
        const locale = hdr.locale || navigator.locale;

        switch (type) {
            case 'timestamp':
            case 'date':
                const fmt = hdr.format == 'true' ? undefined : hdr.format;
                return val && val > 0 ? new GSDate(val).format(fmt, locale) : val;
            case 'string':
            case 'boolean':
            case 'number':
                break;
            case 'currency':
                const opt = { style: 'currency', currency: hdr.currency };
                return new Intl.NumberFormat(locale, opt).format(val);
        }

        return val;
    }

    #toType(hdr, val) {
        if (hdr.type) return hdr.type;
        if (val instanceof Date) return 'date';
        if (val instanceof Number) return 'number';
        if (val instanceof Boolean) return 'boolean';
        return typeof val;
    }

    #onMenu(e) {

    }

    #onClick(e) {
        const me = this;
        const el = e.target;
        const isAppend = e.shiftKey & me.multiselect;

        if (!el.tagName === 'TD') return;
        if (!me.select) return;

        requestAnimationFrame(() => {
            me.#onRowSelect(el.closest('tr'), isAppend, e);
        });

    }

    #onRowSelect(row, append = false, evt) {

        const me = this;
        const isSelected = GSAttr.getAsBool(row, 'selected');

        if (!append) GSDOM$1.queryAll(me, 'tr')
            .forEach(el => {
                GSAttr.set(el, 'class', null);
                GSAttr.set(el, 'selected', null);
            });

        if (row.dataset.ignore === 'true') return;

        GSAttr.set(row, 'class', isSelected ? null : me.cssSelect);
        GSAttr.set(row, 'selected', isSelected ? null : true);

        const data = [];
        GSDOM$1.queryAll(me, 'tr[selected=true]').forEach(el => data.push(parseInt(el.dataset.index)));
        GSEvent.send(me, 'select', { data: data, evt: evt }, true);
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

// use GSStore
// - if data attr set to gs-store id find el
// - if internal gs-store el, use that

/**
 * Boottrap table WebComponent
 * @class
 * @extends {GSElement}
 */
class GSTable extends GSElement {

    static #tagList = ['GS-HEADER', 'GS-STORE'];
    #select = true;
    #multiselect = false;

    #headers = [];

    #data = [];
    #selected = [];

    #store = null;

    #map = {
        'css': 'table',
        'css-header': 'table thead',
        'css-row': 'table tbody tr',
        'css-cell': 'table tbody td'
    };

    #selectCSS = 'bg-dark text-light fw-bold';
    #tableCSS = 'table table-hover table-striped user-select-none m-0';
    #headerCSS = 'user-select-none table-light';
    #rowCSS = '';
    #cellCSS = 'col';

    static {
        customElements.define('gs-table', GSTable);
        Object.seal(GSTable);
    }

    static get observedAttributes() {
        const attrs = ['src', 'select', 'multiselect', 'css', 'css-header', 'css-filter', 'css-columns', 'css-row', 'css-cell', 'css-select'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
        this.#validateAllowed();
    }

    #validateAllowed() {
        const me = this;
        let list = Array.from(me.children).filter(el => el.slot && el.slot !== 'extra');
        if (list.length > 0) throw new Error(`Custom element injection must contain slot="extra" attribute! Element: ${me.tagName}, ID: ${me.id}`);
        list = Array.from(me.childNodes).filter(el => !el.slot);
        const allowed = GSDOM$1.isAllowed(list, GSTable.#tagList);
        if (!allowed) throw new Error(GSDOM$1.toValidationError(me, GSTable.#tagList));
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        me.#setCSS(me.#map[name], newValue);
    }

    disconnectedCallback() {
        const me = this;
        me.#headers = [];
        me.#data = [];
        me.#selected = [];
        me.#store = null;
        super.disconnectedCallback();
    }

    async onReady() {
        const me = this;

        const store = me.store;
        if (!store) {
            const dataID = GSAttr.get('data');
            me.#store = await GSComponents$1.waitFor(dataID);
        }

        super.onReady();
        if (me.contextMenu) me.contextMenu.disabled = true;
        me.attachEvent(me.self, 'sort', e => me.#onColumnSort(e.detail));
        me.attachEvent(me.self, 'filter', e => me.#onColumnFilter(e.detail));
        me.attachEvent(me.self, 'select', e => me.#onRowSelect(e.detail));
        me.attachEvent(me.self, 'action', e => me.#onContextMenu(e));
        me.attachEvent(me, 'data', e => me.#onData(e));

        me.store.page = 1;
    }

    get contextMenu() {
        return this.querySelector('gs-context');
    }

    get store() {
        const me = this;
        if (me.#store) return me.#store;

        me.#store = me.querySelector('gs-store');
        if (!me.#store) {
            const dataID = GSAttr.get('data');
            me.#store = GSDOM$1.query(`gs-data#${dataID}`);
        }
        return me.#store;
    }

    get header() {
        return this.querySelector('gs-header');
    }

    /**
     * Selected records
     */
    get selected() {
        return this.#selected;
    }

    /**
     * If multi row select is enabled
     */
    get multiselect() {
        return this.#multiselect;
    }

    set multiselect(val = false) {
        const me = this;
        me.#multiselect = GSUtil.asBool(val);
    }

    /**
     * If row select is enabled
     */
    get select() {
        return this.#select;
    }

    set select(val = true) {
        const me = this;
        me.#select = GSUtil.asBool(val);
    }

    get css() {
        return GSAttr.get(this, 'css', this.#tableCSS);
    }

    get cssSelect() {
        return GSAttr.get(this, 'css-select', this.#selectCSS);
    }

    get cssHeader() {
        return GSAttr.get(this, 'css-header', this.#headerCSS);
    }

    get cssRow() {
        return GSAttr.get(this, 'css-row', this.#rowCSS);
    }

    get cssCell() {
        return GSAttr.get(this, 'css-cell', this.#cellCSS);
    }

    get cssFilter() {
        return GSAttr.get(this, 'css-filter', '');
    }

    get cssColumns() {
        return GSAttr.get(this, 'css-columns', '');
    }

    set css(val = '') {
        GSAttr.set(this, 'css', val);
    }

    set cssSelect(val = '') {
        GSAttr.set(this, 'css-select', val);
    }

    set cssHeader(val = '') {
        GSAttr.set(this, 'css-header', val);
    }

    set cssFilter(val = '') {
        GSAttr.set(this, 'css-filter', val);
    }

    set cssColumns(val = '') {
        GSAttr.set(this, 'css-columns', val);
    }

    set cssRow(val = '') {
        GSAttr.set(this, 'css-row', val);
    }

    set cssCell(val = '') {
        GSAttr.set(this, 'css-cell', val);
    }

    get noDataText() {
        return GSAttr.get(this, 'no-data', 'No Data');
    }

    set noDataText(val) {
        return GSAttr.set(this, 'no-data', val);
    }

    get isFilterable() {
        return this.#headers.filter(o => o.filter).length > 0;
    }

    #setCSS(qry, val) {
        if (!qry) return;
        this.findAll(qry, true).forEach(el => {
            GSAttr.set(el, 'class', val);
        });
    }

    #onData(e) {
        GSEvent.prevent(e);
        const me = this;
        if (!me.self) return;
        me.#processData(e.detail);
        GSEvent.sendDelayed(10, me.self, 'data', e.detail);
    }

    #processData(data) {
        const me = this;
        me.#data = data;
        me.#selected = [];
        if (!me.#hasHeaders) {
            me.#prepareHeaders();
            me.#renderTable();
            return requestAnimationFrame(() => me.#processData(data));
        }

        requestAnimationFrame(() => me.#renderPage());

    }

    get #hasHeaders() {
        return this.#headers.length > 0;
    }

    #prepareHeaders() {
        const me = this;
        const hdr = me.header;
        me.#headers = hdr ? hdr.toJSON() : [];
        if (me.#headers.length > 0) return;
        if (me.#data.length === 0) return;
        me.#recToHeader(me.#data[0]);
    }

    #recToHeader(rec) {
        const me = this;
        const defs = [];
        defs.push('<gs-header>');
        if (Array.isArray(rec)) {
            defs.push('<gs-column name="#"></gs-column>');
            rec.forEach((v, i) => {
                const html = `<gs-column name="Col_${i + 1}" index=${i}></gs-column>`;
                defs.push(html);
            });
        } else {
            Object.keys(rec).forEach(v => {
                const html = `<gs-column name="${v}"></gs-column>`;
                defs.push(html);
            });
        }
        defs.push('</gs-header>');
        const dom = GSDOM$1.parse(defs.join(''), true);
        me.appendChild(dom);
    }

    #renderPage() {
        const me = this;
        me.self.querySelector('tbody').render(me.#headers, me.#data, me.store.offset);
        const ctx = me.contextMenu;
        if (ctx) {
            ctx.close();
            ctx.reattach();
        }
    }

    #renderTable() {
        const me = this;
        if (!me.#hasHeaders) return;
        const html = me.querySelector('gs-header').render();
        const src = `<table class="${me.css}">${html}<tbody is="gs-tbody"></tbody></table><slot name="extra"></slot>`;
        GSDOM$1.setHTML(me.self, src);
    }

    /**
     * Just update (override) event data, and let it bubble up
     * @param {*} e 
     */
    #onContextMenu(e) {
        const me = this;
        const o = e.detail;
        o.action = o.data.action;
        // clone to prevent removing data by client code
        o.data = [...me.#selected];
        o.type = 'table';
        //const opt = { action: data.data.action, data: me.#selected };
        //GSEvent.send(me, 'action', opt, true, true, true);
    }

    #onRowSelect(data) {
        if (!data) return;
        const me = this;
        me.#selected = [];
        data.data?.forEach(i => {
            const rec = me.#data[i];
            if (rec) me.#selected.push(rec);
        });
        if (me.contextMenu) me.contextMenu.disabled = data.data?.length === 0;
        GSEvent.send(me, 'selected', { data: me.#selected, evt: data.evt });
    }

    #onColumnSort(data) {
        const me = this;
        me.store.sort = data || [];
        GSEvent.send(me, 'sort', me.store.sort);
    }

    #onColumnFilter(data) {
        const me = this;
        me.store.filter = data || [];
        GSEvent.send(me, 'filter', me.store.filter);
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */
 
 /**
  * table header sorting coluns
  * <thead><tr is="gs-tablesort"></tr></thead>
  * @class
  * @extends {HTMLTableRowElement}
  */
 class GSTableSort extends HTMLTableRowElement {
 
     #sc = 0;
 
     static {
         customElements.define('gs-tablesort', GSTableSort, { extends: 'tr' });
         Object.seal(GSTableSort);
     }
 
     connectedCallback() {
         const me = this;
         if (!me.id) me.setAttribute('id', GSID.id);
         GSEvent.attach(me, me, 'click', e => me.#onClick(e));
         GSComponents.store(me);
         me.onReady();
     }
 
     disconnectedCallback() {
         const me = this;
         GSComponents.remove(me);
         GSEvent.deattachListeners(me);
     }
 
     onReady() {
         const me = this;
         requestAnimationFrame(() => {
             me.#autoSortable.forEach((el, i) => me.#onColumnSort(el, i > 0));
         });
     }
 
     get #autoSortable() {
         return this.#sortable.filter(el => el.dataset.order != '0');
     }
 
     get #sorted() {
         return this.#sortable.filter(el => el.dataset.idx != '0');
     }
 
     get #sortable() {
         return GSDOM$1.queryAll(this, 'th[data-sortable="true"]', false, false);
     }
 
     #onClick(e) {
         const me = this;
         const el = e.composedPath().shift();
         if (el.tagName !== 'TH') return;
         if (el.dataset.sortable != 'true') return;
         const ord = GSUtil.asNum(el.dataset.order);
         el.dataset.order = ord > 0 ? -1 : 1;
         requestAnimationFrame(() => me.#onColumnSort(el, e.shiftKey));
     }
 
     #onColumnSort(el, append = false) {
 
         const me = this;
 
         const ord = GSUtil.asNum(el.dataset.order, -1);
 
         if (append) {
             me.#sc = 1 + Math.max.apply(0, me.#sortable.map(el => GSUtil.asNum(el.dataset.idx, 0)));
             GSDOM$1.toggleClass(el, 'sorting_desc sorting_asc table-active', false);
         } else {
             me.#sc = 1;
             GSDOM$1.queryAll(me, 'thead th').forEach(el => {
                 el.dataset.idx = 0;
                 el.dataset.order = 0;
                 GSDOM$1.toggleClass(el, 'sorting_desc sorting_asc table-active', false);
             });
         }
 
         el.classList.add(ord > 0 ? 'sorting_asc' : 'sorting_desc');
         el.dataset.idx = me.#sc;
         el.dataset.order = ord;
         GSDOM$1.toggleClass(el, 'table-active', true);
 
 
         let sort = [];
         me.#sorted.forEach(el => {
             const ord = GSUtil.asNum(el.dataset.order, 1);
             const idx = GSUtil.asNum(el.dataset.idx, 1);
             const name = GSAttr.get(el, 'name', el.innerText);
             const cfg = { ord: ord, col: el.cellIndex, name: name, idx: idx };
             sort.push(cfg);
         });
         sort = GSData.sortData([{ name: 'idx', ord: 1 }], sort);
 
         GSEvent.send(me, 'sort', sort, true);
     }
 
 }

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Table header filter with filtering input fields foer every column
 * <thead><tr is="gs-tablefilter"></tr></thead>
 * @class
 * @extends {HTMLTableRowElement}
 */
class GSTableFilter extends HTMLTableRowElement {

    #auto = false;

    static {
        customElements.define('gs-tablefilter', GSTableFilter, { extends: 'tr' });
        Object.seal(GSTableFilter);
    }

    /*
     * Called when element injected to parent DOM node
     */
    connectedCallback() {
        const me = this;
        me.id = me.id || GSID.id;
        me.#auto = GSDOM$1.query(me, 'input[auto="true"],select[auto="true"]') != null;
        me.#attachChangeListener();
        me.#attachDataListener();
        GSComponents.store(me);
        requestAnimationFrame(() => me.#onChange());
    }

    /*
     * Called when element removed from parent DOM node
     */
    disconnectedCallback() {
        const me = this;
        GSComponents.remove(me);
        GSEvent.deattachListeners(me);
    }

    get root() {
        return GSDOM$1.getRoot(this);
    }

    #attachChangeListener() {
        const me = this;
        GSDOM$1.queryAll(me, 'input, select')
            .forEach(el => GSEvent.attach(me, el, 'change', e => me.#onChange(e.target)));
    }

    #attachDataListener() {
        const me = this;
        if (me.#auto) GSEvent.attach(me, me.root, 'data', e => me.#onData(e.detail), false, true);
    }

    #onChange(el) {
        const me = this;
        const filter = [];
        GSDOM$1.queryAll(me, 'input, select').forEach(el => {
            const value = me.#getValue(el);
            if (value) filter.push({ name: el.name, value: value });
        });
        GSEvent.send(me, 'filter', filter, true);
    }

    #onData(data) {

    }

    #getValue(el) {
        const me = this;
        const listID = GSAttr.get(el, 'list');
        const list = me.root.getElementById(listID);
        const opt = list?.querySelector(`option[value="${el.value}"]`);
        return opt?.dataset?.value || el.value;
    }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Table pagination
 * @class
 * @extends {GSElement}
 */
class GSPagination extends GSElement {

    static CSS_ITEM = 'me-1';

    static {
        customElements.define('gs-pager', GSPagination);
        Object.seal(GSPagination);
    }

    constructor() {
        super();
    }

    async getTemplate(val = '') {
        const me = this;

        const store = me.store;
        const firstlast = me.firstlast;
        const nextprev = me.nextprev;
        const pages = this.pages;

        const html = [];
        html.push('<nav><ul class="pagination justify-content-center m-3">');

        if (firstlast) html.push(me.#getHtml(me.first, 'first', 'First page'));
        if (nextprev) html.push(me.#getHtml(me.previous, 'previous', 'Previous page'));

        let i = 1;
        while (i <= pages) {
            html.push(me.#getHtml(i, '', '', i == store.page));
            i++;
        }

        if (nextprev) html.push(me.#getHtml(me.next, 'next', 'Next page'));
        if (firstlast) html.push(me.#getHtml(me.last, 'last', 'Last page'));

        html.push('</ul></nav>');
        return html.join('');
    }

    #getHtml(text = '', name = '', title = '', active = false) {
        return `<li class="page-item ${GSPagination.CSS_ITEM} ${active ? 'active' : ''}"><a class="page-link" name="${name}" title="${title}" href="#" >${text}</a></li>`;
    }

    #onStore(e) {
        const me = this;
        requestAnimationFrame(() => {
            let page = me.pages === 0 ? 0 : (Math.floor((me.store.page - 1) / me.pages) * me.pages + 1);
            me.queryAll('a[name=""]').forEach(el => {
                el.parentElement.classList.remove('active', 'disabled', 'd-none');
                if (page == me.store.page) el.parentElement.classList.add('active');
                if (page > me.store.pages) el.parentElement.classList.add('disabled', 'd-none');
                el.text = page++;
            });
        });
    }

    #onClick(e) {
        const me = this;
        const val = e.target.name || e.target.text;
        switch (val) {
            case 'first':
                return me.store.firstPage();
            case 'last':
                return me.store.lastPage();
            case 'next':
                return me.store.nextPage();
            case 'previous':
                return me.store.prevPage();
        }

        me.store.page = val || me.store.page;
    }

    onReady() {
        const me = this;
        me.attachEvent(me.store, 'data', me.#onStore.bind(me));
        me.queryAll('a').forEach(el => me.attachEvent(el, 'click', me.#onClick.bind(me)));
    }

    get table() {
        return GSDOM$1.closest(this, 'GS-TABLE');
    }

    /**
     * Either define store atrtibute with store id
     * Or use automatic search for closest table.
     * This allows to put pagination on non-default position
     */
    get store() {
        const me = this;
        const tgt = GSAttr.get(me, 'store');
        return tgt ? GSComponents$1.get(tgt) : me.table.store;
    }

    get nextprev() {
        return GSAttr.getAsBool(this, 'nextprev', true);
    }

    get firstlast() {
        return GSAttr.getAsBool(this, 'firstlast', true);
    }

    get pages() {
        return GSAttr.getAsNum(this, 'pages', 5);
    }

    get first() {
        return GSAttr.get(this, 'first', '&laquo;');
    }

    get last() {
        return GSAttr.get(this, 'last', '&raquo;');
    }

    get next() {
        return GSAttr.get(this, 'next', '&rsaquo;');
    }

    get previous() {
        return GSAttr.get(this, 'previous', '&lsaquo;');
    }
}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Notification container responsible to show toasts
 * @class
 * @extends {GSElement}
 */
class GSNotification extends GSElement {

  static TOP_START = "position-fixed top-0 start-0";
  static TOP_CENTER = "position-fixed top-0 start-50 translate-middle-x";
  static TOP_END = "position-fixed top-0 end-0";
  static MIDDLE_START = "position-fixed top-50 start-0 translate-middle-y";
  static MIDDLE_CENTER = "position-fixed top-50 start-50 translate-middle";
  static MIDDLE_END = "position-fixed top-50 end-0 translate-middle-y";
  static BOTTOM_START = "position-fixed bottom-0 start-0";
  static BOTTOM_CENTER = "position-fixed bottom-0 start-50 translate-middle-x";
  static BOTTOM_END = "position-fixed bottom-0 end-0";

  static DEFAULT = GSNotification.BOTTOM_END;

  #list = new Set();

  static get observedAttributes() {
    const attrs = ['position'];
    return GSElement.observeAttributes(attrs);
  }

  connectCallback() {
    super.connectedCallback();
  }

  attributeCallback(name = '', oldVal = '', newVal = '') {
    const me = this;

    oldVal = me.#fromPosition(oldVal);
    newVal = me.#fromPosition(newVal);

    const el = me.query('div');
    GSDOM$1.toggleClass(el, oldVal, false);
    GSDOM$1.toggleClass(el, newVal, true);
  }

  #fromPosition(val) {
    let css = GSNotification[val];
    return GSUtil.isString(css) && css.startsWith('position-') ? css : val;
  }

  async getTemplate(val = '') {
    const me = this;
    return `<div class="toast-container ${me.css} ${me.position}" style="z-index: 10000;">
    <slot name="content"></slot>
    </div>`;
  }

  /**
   * Generic css for notifiction container
   */
  get css() {
    return GSAttr.get(this, 'css', 'p-3');
  }

  set css(val = '') {
    GSAttr.set(this, 'css', val);
  }

  /**
   * Position where to show notification
   * NOTE: Might interfer with "css" attribute
   */
  get position() {
    return GSAttr.get(this, 'position', GSNotification.DEFAULT);
  }

  set position(val = '') {
    GSAttr.set(this, 'position', val);
  }

  /**
   * Set browser native notification usage
   */
  get native() {
    return GSAttr.getAsBool(this, 'native', false);
  }

  set native(val = '') {
    GSAttr.setAsBool(this, 'native', val);
  }

  info(title = '', message = '', closable = false, timeout = 2) {
    return this.show(title, message, 'text-bg-info', closable, timeout);
  }

  success(title = '', message = '', closable = false, timeout = 2) {
    return this.show(title, message, 'text-bg-success', closable, timeout);
  }

  warn(title = '', message = '', closable = false, timeout = 2) {
    return this.show(title, message, 'text-bg-warning', closable, timeout);
  }

  danger(title = '', message = '', closable = false, timeout = 2) {
    return this.show(title, message, 'text-bg-danger', closable, timeout);
  }

  primary(title = '', message = '', closable = false, timeout = 2) {
    return this.show(title, message, 'text-bg-primary', closable, timeout);
  }

  secondary(title = '', message = '', closable = false, timeout = 2) {
    return this.show(title, message, 'text-bg-secondary', closable, timeout);
  }

  dark(title = '', message = '', closable = false, timeout = 2) {
    return this.show(title, message, 'text-bg-dark', closable, timeout);
  }

  light(title = '', message = '', closable = false, timeout = 2) {
    return this.show(title, message, 'text-bg-light', closable, timeout);
  }

  /**
   * Main function to show notification. 
   * It has support for Bootstrap based and web based notifications.
   * 
   * @async
   * @param {string} title Notification title
   * @param {string} message Notification message
   * @param {string} css CSS styling (web only)
   * @param {boolean} closable Can user close it (web only)
   * @param {number} timeout Timeout after which to close notification
   * @param {object} options Options for native Notification
   * @returns {Promise<Notification|GSToast>}
   */
  async show(title = '', message = '', css = '', closable = false, timeout = 2, options) {
    const me = this;
    if (me.native) {
      let sts = await GSNotification.requestPermission();
      if (sts) sts = me.#showNative(title, message, timeout, options);
      if (sts) return sts;
    }
    return me.#showWeb(title, message, css, closable, timeout);
  }

  #showWeb(title = '', message = '', css = '', closable = false, timeout = 2) {
    const tpl = `<gs-toast slot="content" css="${css}"  closable="${closable}" timeout="${timeout}" message="${message}" title="${title}"></gs-toast>`;
    const el = GSDOM$1.parse(tpl, true);
    this.appendChild(el);
    return el;
  }

  #showNative(title = '', message = '', timeout = 2, options = {}) {
    const me = this;
    options.body = options.body || message;
    const notification = new Notification(title, options);
    me.#list.add(notification);
    const callback = me.#clearNative.bind({ notification: notification, owner: me });
    notification.addEventListener('close', callback);
    if (timeout > 0) setTimeout(callback, timeout * 1000);
    return notification;
  }

  #clearNative() {
    const me = this;
    me.notification.close();
    me.owner.#list.delete(me.notification);
  }

  /**
   * Clear all triggered notifications
   */
  clear() {
    const me = this;
    Array.from(me.querySelectorAll('gs-toast')).forEach(el => el.remove());
    me.#list.forEach(nn => nn.close());
    me.#list.clear();
  }

  /**
   * Check if native notification is supported
   * @returns {boolean} 
   */
  static get isNativeSupported() {
    return "Notification" in self;
  }

  /**
   * Check if native notification is allowed
   * @returns {boolean} 
   */
  static get isGranted() {
    return Notification.permission === "granted";
  }

  /**
   * Request useage for browser native notification
   * 
   * @async
   * @returns {Promise<boolean>} Return granted status
   */
  static async requestPermission() {
    if (!GSNotification.isNativeSupported) return false;
    if (!GSNotification.isGranted) await Notification.requestPermission();
    return GSNotification.isGranted;
  }

  static {
    customElements.define('gs-notification', GSNotification);
    Object.seal(GSNotification);
  }

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Toast popup with self destroy timeout 
 * @class
 * @extends {GSElement}
 */
class GSToast extends GSElement {

  static {
    customElements.define('gs-toast', GSToast);
    Object.seal(GSToast);
  }

  static get observedAttributes() {
    const attrs = ['placement', 'css'];
    return GSElement.observeAttributes(attrs);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    if (name === 'css') {
      const el = me.query('.toast');
      GSDOM$1.toggleClass(el, oldValue, false);
      GSDOM$1.toggleClass(el, newValue, true);
    }

  }

  async getTemplate(val = '') {
    const me = this;
    const btn = me.closable ? '<button type="button" class="btn-close me-2 m-auto"></button>' : '';
    return `
        <div class="mt-1 mb-1 toast fade ${me.visible ? 'show' : ''} ${me.css}">
          <div class="d-flex">
              <div class="toast-body">
              ${me.message}
              </div>
              ${btn}
          </div>
      </div>    
    `
  }

  onReady() {
    const me = this;
    const btns = me.queryAll('button');
    Array.from(btns).forEach(btn => me.attachEvent(btn, 'click', me.close.bind(me)));
    super.onReady();
    if (me.visible) me.open();
  }

  show(title = '', message = '', css = '', visible = true, closable = false, timeout = 2) {
    const me = this;
    me.css = css || me.css;
    me.title = title;
    me.message = message;
    me.timeout = timeout;
    me.closable = closable == true;
    me.visible = visible == true;
    me.open();
  }

  open() {
    const me = this;
    requestAnimationFrame(async () => {
      GSDOM$1.toggleClass(this.#toast, 'show', true);
      if (me.timeout <= 0) return;
      await GSUtil.timeout(me.timeout * 1000);
      me.close();
    });
  }

  close() {
    this.#dismiss();
  }

  dismiss() {
    this.#dismiss();
  }

  async #dismiss() {
    GSDOM$1.toggleClass(this.#toast, 'show', false);
    await GSUtil.timeout(GSDOM$1.SPEED);
    return this.remove();
  }

  get #toast() {
    return this.query('.toast');
  }

  /**
   * Prevent shadow dom
   */
  get isFlat() {
    return true;
  }

  get title() {
    return GSAttr.get(this, 'title');
  }

  set title(val = '') {
    GSAttr.set(this, 'title', val);
  }

  get message() {
    return GSAttr.get(this, 'message');
  }

  set message(val = '') {
    GSAttr.set(this, 'message', val);
  }

  get css() {
    return GSAttr.get(this, 'css');
  }

  set css(val = '') {
    GSAttr.set(this, 'css', val);
  }

  get timeout() {
    return GSAttr.getAsNum(this, 'timeout', 2);
  }

  set timeout(val = 2) {
    GSAttr.set(this, 'timeout', val);
  }

  get closable() {
    return GSAttr.getAsBool(this, 'closable');
  }

  set closable(val = true) {
    GSAttr.set(this, 'closable', val == true);
  }

  get visible() {
    return GSAttr.getAsBool(this, 'visible', true);
  }

  set visible(val = true) {
    GSAttr.set(this, 'visible', val == true);
  }

}

export { GSAccordion, GSAlert, GSAttachment, GSButton, GSCenter, GSColumn, GSComboExt, GSContext, GSCurrencyFormat, GSDataAttr, GSDataListExt, GSDateFormat, GSDialog, GSDropdown, GSFileBox, GSFormExt, GSFormGroup, GSHeader, GSInputExt, GSLayout, GSList, GSModal, GSNav, GSNavLinkExt, GSNotification, GSOffcanvas, GSPagination, GSPopover, GSPopup, GSProgress, GSSplitter, GSStore, GSTBody, GSTab, GSTable, GSTableFilter, GSTableSort, GSTimeFormat, GSToast, GSTooltip, GSYearFormat };
