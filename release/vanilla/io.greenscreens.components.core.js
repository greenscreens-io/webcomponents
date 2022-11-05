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
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * Adoptable CSS - css template for WebComponents
 * Does not support style disabling / theming
 * @class
 * @extends HTMLLinkElement
 */
class GSLinkExt extends HTMLLinkElement {

	#callback = null;

	constructor() {
		super();
		const me = this;
		if (!me.order) me.order = GSBase.nextID();
		if (!me.isCSS) return;
		me.#callback = setInterval(me.#onLoad.bind(me), 1);
	}

	connectedCallback() {
	}

	disconnectedCallback() {
		const me = this;
		if (!me.isCSS) return;
		const sheet = GSCacheStyles.remove(me.order);
		GSBase.sendSuspendedEvent(document, 'gs-style', sheet);
	}

	#onLoad() {
		const me = this;
		const sheet = me.sheet;
		if (!sheet) return;
		clearInterval(me.#callback);
		//GSCacheStyles.getOrSet(me.order, sheet);		
		GSCacheStyles.injectStyle(me.asText, me.order);
		const proxy = GSCacheStyles.get(me.order);
		GSBase.sendSuspendedEvent(document, 'gs-style', proxy);
	}

	/**
	 * Get this CSS source
	 * @returns {string}
	 */
	get asText() {
		return Object.values(this.sheet.cssRules).map(o => o.cssText).join('');
	}

	/**
	 * Get this element CSS instance
	 * @returns {CSSStyleSheet}
	 */
	get sheet() {
		const me = this;
		return Object.values(document.styleSheets).filter(sh => sh.ownerNode === me).pop();
	}

	/**
	 * Check if this element is CSS
	 * @returns {boolean}
	 */
	get isCSS() {
		const me = this;
		return me.rel === 'stylesheet' || me.href.includes('.css');
	}

	/**
	 * Injection order inside lsit of loaded styles
	 * @returns {number}
	 */
	get order() {
		return this.getAttribute('order');
	}

	set order(val = '') {
		return this.setAttribute('order', val);
	}

	static {
		customElements.define('gs-ext-link', GSLinkExt, { extends: 'link' });
		Object.freeze(GSLinkExt);
	}
}

/*
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * Adoptable CSS - css template for WebComponents
 * Does not support style disabling / theming
 * @class
 * @extends HTMLStyleElement
 */
class GSStyleExt extends HTMLStyleElement {

	#callback = null;

	constructor() {
		super();
		const me = this;
		if (!me.order) me.order = GSBase.nextID();
		me.#callback = setInterval(me.#onLoad.bind(me), 1);
	}

	connectedCallback() {
	}

	disconnectedCallback() {
		const me = this;
		const sheet = GSCacheStyles.remove(me.order);
		GSBase.sendSuspendedEvent(document, 'gs-style', sheet);
	}

	#onLoad() {
		const me = this;
		const sheet = me.sheet;
		if (!sheet) return;
		clearInterval(me.#callback);
		//GSCacheStyles.getOrSet(me.order, sheet);		
		GSCacheStyles.injectStyle(me.asText, me.order);
		const proxy = GSCacheStyles.get(me.order);
		GSBase.sendSuspendedEvent(document, 'gs-style', proxy);
	}

	get asText() {
		return Object.values(this.sheet.cssRules).map(o => o.cssText).join('');
	}

	get sheet() {
		const me = this;
		return Object.values(document.styleSheets).filter(sh => sh.ownerNode === me).pop();
	}

	get order() {
		return this.getAttribute('order');
	}

	set order(val = '') {
		return this.setAttribute('order', val);
	}

	static {
		Object.freeze(GSStyleExt);
		customElements.define('gs-ext-style', GSStyleExt, { extends: 'style' });
	}

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * WebComponents shared CSS
 * 
 * To change theme use hashtag (auto=true retured and theme=THEME_NAME)
 * http://localhost:8080/demos/button.html#theme=bs
 * 
 * <gs-css auto="true" global="true" src="/webcomponents/assets/css/custom.css" rel="stylesheet"></gs-css>
 * <gs-css auto="true" global="true" src="/webcomponents/assets/css/bootstrap_5.2.0.css" rel="stylesheet" disabled="true" theme="bs"></gs-css>
 * 
 * Use attribute disabled to disable theme programatically
 * @class
 * @extends head/GSBase
 */
class GSCSS extends GSBase {

	static get observedAttributes() {
		return ['disabled'].concat(super.observedAttributes);
	}

	attributeCallback(name, oldValue, newValue) {
		const me = this;
		if (name !== 'disabled') return;
		return me.isDisabled ? me.dispose() : me.render();
	}

	constructor() {
		super();
		const me = this;
		me.disabled = me.notheme == false && me.theme !== GSCSS.activeTheme;
		//me.disabled = !(me.theme === 'default' || me.theme === GSCSS.activeTheme);
	}

	/**
	 * Load, initialize and cache stylesheet for sharing among WebComponents
	 * 
	 * @async
	 * @returns {Promise}
	 */
	async render() {
		const me = this;
		if (me.isDisabled) return;
		if (!me.order) me.order = GSBase.nextID();
		//const hash = GSBase.hashCode(me.url);
		try {
			const res = await fetch(me.url);
			if (!res.ok) return;
			const css = await res.text();
			GSCacheStyles.injectStyle(css, me.order);
			const sheet = GSCacheStyles.get(me.order);
			if (sheet) GSBase.sendSuspendedEvent(document, 'gs-style', sheet);
		} catch (e) {
			GSCacheStyles.remove(me.order);
			console.log(e);
		}

	}

	dispose() {
		const me = this;
		if (!me.isAuto) return;
		const sheet = GSCacheStyles.get(me.order);
		GSCacheStyles.remove(me.order);
		GSBase.sendSuspendedEvent(document, 'gs-style', sheet);
		document.adoptedStyleSheets = GSCacheStyles.styles;
	}

	/**
	 * Sortable value, order in stylecache list
	 * @returns {boolean}
	 */
	get order() {
		return this.getAttribute('order');
	}

	set order(val = '') {
		return this.setAttribute('order', val);
	}

	/**
	 * If set to true, theme switcher will ignore this style (considered mandatory)
	 * @returns {boolean} Default to false
	 */
	get notheme() {
		return this.getAttribute('notheme') === 'true';
	}

	/**
	 * Disable this style 
	 * @returns {boolean}
	 */
	get disabled() {
		return this.getAttribute('disabled');
	}

	set disabled(val = '') {
		return this.setAttribute('disabled', '' + val == 'true');
	}

	/**
	 * Check if style is disabled
	 * @returns {boolean}
	 */
	get isDisabled() {
		return this.disabled === 'true';
	}

	/**
	 * Theme name used for theme switcher
	 * @returns {string}
	 */
	get theme() {
		return this.getAttribute('theme') || 'default';
	}

	/**
	 * Extract currently used style theme
	 * @returns {string}
	 */
	static get activeTheme() {
		const sp = new URLSearchParams(location.hash.slice(1));
		return sp.get('theme') || 'default';
	}

	static #onTheme(e) {
		const theme = GSCSS.activeTheme;
		Array.from(document.querySelectorAll('gs-css'))
			.filter(el => el.notheme == false)
			.forEach(el => el.disabled = el.theme !== theme);
	}

	static {
		Object.freeze(GSCSS);
		customElements.define('gs-css', GSCSS);
		window.addEventListener('hashchange', GSCSS.#onTheme, false);
	}

}

/*
 * Copyright (C) 2015, 2020  Green Screens Ltd.
 */

/**
 * Script element to load src based on environment
 * @class
 * @extends head/GSBase
 */
class GSScript extends GSBase {

	/**
	 * Called every time node is added to parent node
	 */
	render() {

		const me = this;
		const el = document.createElement('script');

		el.src = me.url;
		me.getAttributeNames().filter(v => v !== 'url').forEach(v => el.setAttribute(v, me.getAttribute(v)));

		return el;

	}

	static {
		customElements.define('gs-script', GSScript);
		Object.freeze(GSScript);
	}

}

/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * Link element to load css src based on environment
 * To support custom components shared styling use shadow=true attribute
 * @class
 * @extends head/GSBase
 */
class GSLink extends GSBase {

	/**
	 * Called every time node is added to parent node
	 */
	render() {

		const me = this;
		const el = document.createElement('link');

		el.href = me.url;
		me.getAttributeNames().filter(v => v !== 'url').forEach(v => el.setAttribute(v, me.getAttribute(v)));

		if (me.shadow && el.rel === 'stylesheet') el.setAttribute('is', 'gs-ext-link');

		return el;

	}

	get rel() {
		const me = this;
		let rel = me.getAttribute('rel') || '';
		if (!rel) {
			if (me.url.includes('.css')) {
				rel = 'stylesheet';
			}
		}
		return rel;
	}

	get shadow() {
		return this.getAttribute('shadow') === 'true';
	}

	static {
		customElements.define('gs-link', GSLink);
		Object.freeze(GSLink);
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
class GSDOM {

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

		const doc = GSDOM.parse(src);
		const nodes = GSDOM.#fromNode(doc.head.children).concat(GSDOM.#fromNode(doc.body.children));
		const wrap = forceWrap || nodes.length !== 1;

		const tpl = GSDOM.wrap(own, wrap ? null : nodes.shift());

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
		return GSDOM.link(own, target || document.createElement('gs-block'));
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
		return Array.from(nodes || []).filter(el => !GSDOM.isText(el));
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

		const it = GSDOM.inheritance(el);
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
		const it = GSDOM.inheritance(el);
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
		return Array.from(el?.childNodes || []).filter(e => GSDOM.isGSElement(e));
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
		const injectable = GSDOM.isHTMLElement(newEl) || GSDOM.isSVGElement(newEl);
		const isOK = GSDOM.isHTMLElement(target) && injectable;
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
		const isok = GSDOM.isHTMLElement(target) && GSDOM.isHTMLElement(newEl);
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
		const isok = GSDOM.isHTMLElement(target) && GSDOM.isHTMLElement(newEl);
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
		return closest ? GSDOM.parentAll(node) : GSDOM.childAll(node, all, shadow);
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
		if (shadow) yield* GSDOM.childAll(node.shadowRoot, all, shadow, true);
		const list = all ? node.childNodes : node.children;
		if (!list) return;
		for (let child of list) {
			yield* GSDOM.childAll(child, all, shadow, true);
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
		let e = GSDOM.parent(el);
		while (e) {
			yield e;
			e = GSDOM.parent(e);
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

		const it = GSDOM.parentAll(el);
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
		if (typeof el === 'string') return GSDOM.getByID(document.body, id);
		if (!(el && id)) return null;
		const it = GSDOM.walk(el, false);
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
		if (typeof el === 'string') return GSDOM.closest(document.body, qry);
		if (!(el && qry)) return null;
		const it = GSDOM.walk(el, true);
		for (let o of it) {
			if (GSDOM.matches(o, qry)) return o;
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
		if (typeof el === 'string') return GSDOM.query(document.body, el, all, shadow);
		if (!(el && qry)) return null;
		if (GSDOM.matches(el, qry)) return el;
		const it = GSDOM.walk(el, false, all, shadow);
		for (let o of it) {
			if (GSDOM.matches(o, qry)) return o;
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
		if (typeof el === 'string') return GSDOM.queryAll(document.body, el, all, shadow);
		const res = [];
		if (!(el && qry)) return res;
		const it = GSDOM.walk(el, false, all, shadow);
		for (let o of it) {
			if (GSDOM.matches(o, qry)) res.push(o);
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
		if (!GSDOM.isHTMLElement(el)) return false;
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
		return GSDOM.toggleClass(el, 'd-none', sts);
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
		const root = GSDOM.unwrap(owner);
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
		if (!GSDOM.isHTMLElement(el)) return undefined;
		if ('checkbox' === el.type) return el.checked;
		let value = el.value;
		if ('text' === el.type) {
			const map = GSDOM.styleValue(el, 'text-transform');
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
		if (!GSDOM.isHTMLElement(el)) return;
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
		const map = GSDOM.getComputedStyledMap(el);
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
		const root = GSDOM.unwrap(owner);
		const params = {};
		const list = GSDOM.queryAll(root, qry); // root.querySelectorAll(qry);
		Array.from(list)
			.filter(el => el.name)
			.filter(el => el.dataset.ignore !== 'true')
			.filter(el => invalid ? true : el.checkValidity())
			.forEach(el => {
				params[el.name] = GSDOM.toValue(el);
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
		const root = GSDOM.unwrap(owner);
		const list = GSDOM.queryAll(root, qry); // root.querySelectorAll(qry);
		Array.from(list)
			//.filter(el => el.name && Object.hasOwn(obj, el.name))
			.filter(el => el.name && el.name in obj)
			.forEach(el => GSDOM.fromValue(el, obj[el.name]));
	}

	/**
	 * Convert URL hash key/value to form elements
	 * @param {HTMLElement} owner 
	 */
	static fromURLHashToForm(owner) {
		location.hash.slice(1).split('&').every((v) => {
			if (v.length < 2) return true;
			const d = v.split('=');
			GSDOM.setValue(`input[name=${d[0]}]`, d[1], owner);
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
		GSDOM.queryAll(own, qry).forEach(el => el.removeAttribute('disabled'));
	}

	/**
	 * Disable input on all input elements under provided owner
	 * @param {HTMLElement} own 
	 * @param {string} qry Default to form
	 */
	static disableInput(own, qry = 'input, select, .btn') {
		GSDOM.queryAll(el, qry).forEach(el => el.setAttribute('disabled', true));
	}

	/**
	 * Set value to a element by css selector
	 * @param {string} qry 
	 * @param {string} val 
	 * @param {HTMLElement} own 
	 */
	static setValue(qry, val, own) {
		const el = GSDOM.query(own, qry);
		GSDOM.fromValue(el, val);
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
		const ts = GSDOM.textNodesUnder(root || document).filter(t => t.wholeText.trim().length === 0);
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
		const ok = GSDOM.isAllowed(Array.from(own.childNodes), whiteList);
		if (ok) return true;
		if (asState) return false;
		const msg = GSDOM.toValidationError(own, whiteList);
		throw new Error(msg);
	}

	/**
	 * Check against provided list, if child elements allowed inside provided element
	 * @param {HTMLElement|Array<HTMLElement>} el Element which childs to validate against provided list
	 * @param {string} whiteList Uppercase list of tag names allowed as child nodes
	 * @returns {boolean} return tr ue if validation is ok.
	 */
	static isAllowed(el, whiteList) {
		if (Array.isArray(el)) return el.filter(el => GSDOM.isAllowed(el, whiteList)).length === 0;
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
		Object.seal(GSDOM);
		globalThis.GSDOM = GSDOM;
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
		return GSDOM.queryAll(own, qry).map(el => el.addEventListener(event, callback, opt));
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
		return GSDOM.queryAll(own, qry).map(el => el.removeEventListener(event, callback));
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
 * A module loading GSComponent class
 * @module base/GSComponents
 */

/**
 * Registry cache of all instantiated GS-* elements
 * @class
 */
class GSComponents {

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
        GSComponents.#cache.add(el);
    }

    /**
     * Remove component from component registry cache by id or GSElement instance
     * @param {GSElement|string} el 
     * @returns {void}
     */
    static remove(el) {
        GSComponents.#cache.delete(el);
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
            let el = GSComponents.find(name) || GSComponents.get(name);
            return el ? r(el) : GSComponents.#waitForInternal(name, timeout, r);
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
        const el = GSComponents.find(name) || GSComponents.get(name);
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

        let result = Array.from(GSComponents.#cache);
        if (name) result = result.filter(el => el && GSDOM.matches(el, name));
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
        return GSComponents.findAll(name, flat, shadow).shift();
    }

    /**
    * Returns owner of this shadowRoot element
    * @param {HTMLElement} el An instance of HTMLElement
    * @param {string} type A tag name of searched element
    * @returns {HTMLElement} A parent of provided element
    */
    static getOwner(el, type) {
        const isEl = GSDOM.isGSElement(el) || GSDOM.isHTMLElement(el);
        if (!isEl) return null;

        const it = GSDOM.parentAll(el);
        for (let v of it) {
            if (!v) break;
            if (v instanceof ShadowRoot) {
                const parent = GSDOM.parent(v);
                if (!type) return parent;
                if (GSDOM.isElement(parent, type)) return parent;
                return GSComponents.getOwner(parent, type);
            }
            if (GSDOM.isElement(v, type)) return v;
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
        return GSComponents.hasFunc(own, name, 'get');
    }

    /**
     * Check if class instance has defined property setter 
     * @param {object} own Class instance
     * @param {string} name Getter name to check
     * @returns {boolean} Returns true if setter exist
     */
    static hasSetter(own, name) {
        return GSComponents.hasFunc(own, name, 'set');
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
        if (GSComponents.#listener) return;
        document.addEventListener('gs-style', GSComponents.#onStyles);
        GSComponents.#listener = true;
    }

    /**
     * Remove global WebComponent css style changes listner 
     * @returns {void}
     */
    static unlistenStyles() {
        document.removeEventListener('gs-style', GSComponents.#onStyles);
        GSComponents.#listener = false;
    }

    static #listener = false;
    static #onStyles() {
        requestAnimationFrame(() => {
            GSComponents.findAll(null, false, true).filter(el => el.shadowRoot).forEach(el => el.shadowRoot.adoptedStyleSheets = GSCacheStyles.styles);
        });
    }

    static {
        Object.freeze(GSComponents);
        GSComponents.listenStyles();
        globalThis.GSComponents = GSComponents;
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
            const el = GSDOM.query(document.documentElement, def);
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
		return GSDOM.validate(own, tagName, GSItem.#tags);
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
		if (!GSDOM.isHTMLElement(root)) return [];
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
 * Contaner for flat rendering (without Shadow DOM)
 * @class
 * @extends HTMLElement
 */
class GSBlock extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
    }

    disconnectedCallback() {
        const me = this;
        const el = GSDOM.query(document.body, me.proxy);
        if (el) el.remove();
    }

    /**
     * Return an ID of GSComponent class that owns this element
     * @returns {string} An ID of GSComponent class
     */
    get proxy() {
        return GSAttr.get(this, 'proxy');
    }

    static {
        customElements.define('gs-block', GSBlock);
        Object.seal(GSBlock);
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
		return GSComponents.getOwner(this);
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
		return GSDOM.getByID(this, query);
	}

	/**
	 * Find closest top element by CSS selector
	 * @param {string} query 
	 * @returns {HTMLElement}
	 */
	closest(query = '') {
		return GSDOM.closest(this, query);
	}

	/**
	 * Find element by CSS selector (top level is this element)
	 * @param {string} name 
	 * @returns {HTMLElement}
	 */
	query(query = '', all = false) {
		const me = this;
		const el = GSDOM.query(me.self, query, all, true);
		if (me.isProxy || el) return el;
		return GSDOM.query(me, query, all, false);
	}

	/**
	 * Find multiple elements by CSS selector (top level is this element)
	 * @param {string} query 
	 * @returns {Array<HTMLElement>}
	 */
	queryAll(query = '', all = false) {
		const me = this;
		const list = GSDOM.queryAll(me.self, query, all, true);
		if (me.isProxy || list.length > 0) return list;
		return GSDOM.queryAll(me, query, all, false);
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
		GSDOM.hide(this, orientation);
	}

	/**
	 * Show current component
	 * @param {boolean} orientation 
	 */
	show(orientation = false) {
		GSDOM.show(this, orientation);
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
		GSComponents.store(me);
		requestAnimationFrame(() => me.#render());
	}

	/**
	 * Called when element removed from parent DOM node
	 */
	disconnectedCallback() {
		const me = this;
		me.#removed = true;
		if (me.#observer) me.#observer.disconnect();
		GSComponents.remove(me);
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
			GSComponents.remove(oldValue);
			GSComponents.store(me);
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
		const pe = GSComponents.getOwner(me, GSElement);
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
					me.#content = GSDOM.parseWrapped(me, src, true);
				} else {
					me.#content = GSDOM.parse(src, true);
					me.#content.id = me.id;
					me.id = GSID.id;
				}
				GSDOM.link(me, me.#content);
				GSDOM.insertAdjacent(inject.target, me.#content, inject.anchor);
				return;
			}

			if (inject.target === me) {
				if (me.isFlat) {
					if (src) {
						const tpl = GSDOM.parseWrapped(me, src, false);
						me.#content = tpl;
						GSDOM.insertAdjacent(inject.target, tpl, inject.anchor);
					} else {
						me.#content = me;
					}
				} else {
					me.#content = me.#shadow;
					GSDOM.setHTML(me.#content, src);
				}
				return;
			}


			if (inject.target === me.parentElement) {
				me.#content = me.isFlat ? me : me.#shadow;
				GSDOM.setHTML(me.#content, src);
				return;
			}

			me.#content = GSDOM.parseWrapped(me, src, true);
			GSDOM.link(me, me.#content);
			GSDOM.insertAdjacent(inject.target, me.#content, inject.anchor);

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
				el = GSDOM.query(document.documentElement, target);
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
 * Support for i18n Internationalization
 * Class loads requested language translations and applies to the templates
  * @class
 */
class GSi18n extends HTMLElement {

    static #expr = /\{\w+\}/g;

    static #init = false;
    #languages = new Map();

    #cache = new Set();
    #loading = false;

    #interval = 0;
    #isDuplicate = false;
    #filter = this.#onFilter.bind(this);
    #callback = this.#onCallback.bind(this);

    static {
        customElements.define('gs-i18n', GSi18n);
        Object.seal(GSi18n);
        document.body.addEventListener('i18n', (e) => {
            if (GSi18n.default) GSi18n.default.translateDOM(e.detail);
        });
    }

    static get observedAttributes() {
        return ['lang', 'auto'];
    }

    static get default() {
        return GSi18n.#init;
    }

    constructor() {
        super();
    }

    connectedCallback() {
        const me = this;
        me.id = me.id ? me.id : GSID.id;
        me.#isDuplicate = GSComponents.find(this.tagName) ? true : false;
        if (me.#isDuplicate) return console.log(`${me.tagName} ID: ${me.id} is ignored, i18n is already in use by another instance!`);
        GSi18n.#init = me;
        GSComponents.store(me);
        me.#toggleAuto();
    }

    disconnectedCallback() {
        const me = this;
        clearInterval(me.#interval);
        GSDOMObserver.unregisterFilter(me.#filter, me.#callback);
        GSComponents.remove(me);
        me.#languages.clear();
        me.#languages = null;
        me.#callback = null;
        me.#filter = null;
        if (!me.#isDuplicate) GSi18n.#init = null;
    }

    attributeChangedCallback(name = '', oldVal = '', newVal = '') {
        this.#attributeChanged(name, oldVal, newVal);
    }

    async #attributeChanged(name = '', oldVal = '', newVal = '') {

        const me = this;

        if (name === 'lang') {
            if (!me.#languages.has(newVal)) {
                await me.#load(newVal);
            }
            me.translateDOM(document.documentElement, me.auto);
        }

        if (name === 'auto') {
            me.#toggleAuto();
        }
    }

    #acceptedElement(el) {
        return (!(el instanceof HTMLScriptElement
            || el instanceof HTMLStyleElement
            || el instanceof HTMLLinkElement
            || el instanceof HTMLMetaElement
            || el instanceof Comment));
    }

    #onFilter(el) {

        const me = this;
        const isText = el instanceof Text;

        if (isText && el.textContent.trim().length == 0) return false;

        const tmp = isText ? el.parentElement : el;
        return me.#acceptedElement(tmp) && me.#isTranslatable(tmp);
    }

    #isTranslatable(el) {
        return GSAttr.get(el, 'translate') !== 'false';
    }

    #onCallback(el) {
        const me = this;
        me.#cache.add(el);
    }

    #onInterval() {
        const me = this;
        if (me.#loading) return;
        if (me.#cache.size === 0) return;
        requestAnimationFrame(() => {
            try {
                Array.from(me.#cache).forEach(el => {
                    me.#cache.delete(el);
                    me.#doTranslate(el);
                });
            } catch (e) {
                console.log(e);
            }
        });
    }

    #doTranslate(el) {
        const me = this;
        if (me.#loading > 0) return me.#cache.add(el);
        if (el === document.documentElement) {
            me.translateDOM(el, me.auto);
        } else {
            const isText = (el instanceof Text);
            isText ? me.#doTranslateText(el) : me.#doTranslateAttrs(el);
        }
        if (el.shadowRoot) me.translateDOM(el.shadowRoot, me.auto);
    }

    #doTranslateAttrs(el) {
        const me = this;
        me.list.forEach(attr => me.#doTranslateAttr(el, attr));
    }

    #doTranslateAttr(el, name) {

        const me = this;

        const dname = `data-gs-i8n-${name}`;

        let dval = GSAttr.get(el, dname);
        let val = GSAttr.get(el, name);

        if (dval) {
            val = dval;
        } else if (val) {
            GSAttr.set(el, dname, val);
        }

        if (val) GSAttr.set(el, name, me.translate(val));
    }

    #doTranslateText(el) {
        const me = this;
        el.gsi18n = el.gsi18n || el.textContent;
        el.textContent = me.translate(el.gsi18n);
    }

    async #load(lang = '') {

        const me = this;
        const headers = {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };

        let res = null;
        try {
            me.#loading++;
            const url = GSLoader.normalizeURL(`${me.url}/${lang}.json`);

            res = await GSLoader.load(url, 'GET', headers, true);
            if (!res && lang.indexOf('_') > 0) res = await me.#load(lang.split('_')[0]);
            if (!res) return false;
            me.#store(lang, res);

        } finally {
            me.#loading--;
        }

        if (!me.auto) me.#onInterval();

        return true;
    }

    /**
     * Store object properties as set of key-value pairs,
     * keys are not stores as name, but as hash calc
     * values double stored as a hash-key/value and hash-value/hash-key
     * 
     * @param {string} lang 
     * @param {object} obj 
     * @returns 
     */
    #store(lang, obj) {
        if (!(obj && lang)) return false;
        const map = this.#getLanguage(lang);
        Object.entries(obj).forEach((kv) => {
            const hk = GSID.hashCode(kv[0]);
            map.set(hk, kv[1]);
        });
        return true;
    }

    /**
     * Get language map. Create a new one if not found.
     * @param {*} val 
     * @returns 
     */
    #getLanguage(val = '') {
        const me = this;
        if (!me.#languages.has(val)) {
            me.#languages.set(val, new Map());
            me.#load(val);
        }
        return me.#languages.get(val);
    }

    #toggleAuto() {
        const me = this;
        if (me.auto) {
            GSDOMObserver.registerFilter(me.#filter, me.#callback);
            me.#interval = setInterval(me.#onInterval.bind(me), 500);
        } else {
            GSDOMObserver.unregisterFilter(me.#filter, me.#callback);
            clearInterval(me.#interval);
        }
    }

    /**
     * Translate complete tree from given node.
     * 
     * @param {HTMLElement | Text} el Node to  translate from (inclusive)
     * @param {boolean} auto Immediate translate or automated 
     */
    translateDOM(el, auto = false) {

        const me = this;

        if (el !== document.documentElement) me.#cache.add(el);
        Array.from(el.childNodes)
            .filter(el => me.#onFilter(el))
            .forEach(el => el.childNodes.length == 0 ? me.#cache.add(el) : me.translateDOM(el, true));

        if (!auto) me.#onInterval();
    }

    /**
     * Translate text from default language to the requested one
     * 1. full string hash is searched for mapping
     * 2. string keys are extracted, then hashed and replaced
     * 
     * @param {*} val 
     * @returns 
     */
    translate(val) {

        if (GSUtil.isStringEmpty(val)) return val;

        const me = this;

        let tmp = val;
        let key = null;
        let res = null;
        let arr = null;

        GSi18n.#expr.lastIndex = -1;
        while ((arr = GSi18n.#expr.exec(val)) !== null) {
            key = arr[0];
            res = me.find(key.slice(1, -1));
            tmp = tmp.replace(key, res);
        }

        return tmp;
    }

    /**
     * Find string or key for translation
     * 
     * @param {string} val translation  key name
     * 
     * @returns {string} translated text
     */
    find(val) {
        const me = this;
        const hv = GSID.hashCode(val);
        return me.#getLanguage(me.lang).get(hv) || val;
    }

    /**
     * Enable auto translation by monitoring DOM
     * If set to false, translation must be called from code
     */
    get auto() {
        return GSAttr.getAsBool(this, 'auto', true);
    }

    set auto(val = '') {
        GSAttr.setAsBool(this, 'auto', val);
    }

    /**
     * Default page langugae, use page language, or browser languge if value not set
     */
    get default() {
        return GSAttr.get(this, 'default', document.documentElement.lang || navigator.language);
    }

    set default(val = '') {
        GSAttr.set(this, 'default', val);
    }

    /**
     * Language to which to translate
     */
    get lang() {
        return GSAttr.get(this, 'lang', this.default);
    }

    set lang(val = '') {
        GSAttr.set(this, 'lang', val);
    }

    /**
     * List of attributes on an element used to translate.
     */
    get list() {
        const val = GSAttr.get(this, 'list', 'title,comment');
        return val.split(',');
    }

    set list(val = '') {
        val = Array.isArray(val) ? val.join(',') : val;
        GSAttr.set(this, 'list', val);
    }

    /**
     * URL from where to load JSON translation documents
     */
    get url() {
        return GSAttr.get(this, 'url', `${location.origin}/i18n/`);
    }

    set url(val = '') {
        GSAttr.set(this, 'url', val);
    }

}

/*
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * Template cache to store loaded and preprocessed templates for reuse
 * @class
 */
class GSCacheTemplate {

	static _store = new Map();

	/**
	 * Store pre-processed template into a cache under given name. 
	 * Name is usually a path to a template.
	 * @param {string} name Name of a template
	 * @param {HTMLTemplateElement} template Preprocessed template
	 */
	static store(name, template) {
		this._store.set(name, template);
	}

	/**
	 * Remove template from cache
	 * @param {string} name Name of a template
	 * @returns {boolean}
	 */
	static remove(name) {
		return this._store.delete(name);
	}

	/**
	 * Get template from cache by it's name.
	 * @param {*} name Name of a template
	 * @returns {HTMLTemplateElement}
	 */
	static load(name) {
		return this._store.get(name);
	}

	/**
	 * Helper function to retrieve alreaady existing template by name,
	 *  or inject a new one if does not exists already and return template instance.
	 * @param {string} name 
	 * @param {string} template 
	 * @returns {HTMLTemplateElement}
	 */
	static getOrCreate(name, template) {
		const me = GSCacheTemplate;
		let el = me.load(name);
		if (el) return el;
		el = me.create(template);
		me.store(name, el);
		return el;
	}

	/**
	 * Create template element from loaded template source
	 * 
	 * @param {string} template 
	 * @returns {HTMLTemplateElement}
	 */
	static create(template) {
		const el = document.createElement('template');
		GSDOM.setHTML(el, template);
		return el;
	}

	/**
	 * Clone data from template element
	 * 
	 * @param {HTMLTemplateElement} template 
	 * @returns {HTMLTemplateElement}
	 */
	static clone(template) {
		return GSDOM.isTemplateElement(template) ? template.content.cloneNode(true) : null;
	}

	/**
	 * Check if template is retrieved from function
	 * 
	 * @param {string} tpl 
	 * @returns {boolean}
	 */
	static isFunctionTemplate(tpl) {
		const fn = GSFunction.parseFunction(tpl);
		return GSFunction.isFunction(fn) ? fn : false;
	}

	/**
	 * Check if template is retrieved from html code
	 * 
	 * @param {string} tpl 
	 * @returns {boolean}
	 */
	static isHTMLTemplate(tpl) {
		const val = tpl ? tpl.trim() : '';
		//return (val.startsWith('<') && val.endsWith('>')) ? tpl : false;
		return /^<(.*)>$/s.test(val) ? tpl : false;
	}

	/**
	 * Check if template is retrieved from URL
	 * 
	 * @param {string} tpl 
	 * @returns {boolean}
	 */
	static isURLTemplate(tpl) {
		const val = tpl ? tpl.trim() : '';
		return /^(https?:\/\/|.{0,2}\/{1,2})/i.test(val) ? tpl : false;
	}

	/**
	 * Initialize loaded template
	 * 
	 * @param {boolean} cached Set to true to auto cache if template does not exist
	 * @param {string} name Template name
	 * @param {string} template Template source
	 * @returns {HTMLTemplateElement} Template instance
	 */
	static initTemplate(cached = false, name = '', template) {
		const me = GSCacheTemplate;
		if (cached) return me.getOrCreate(name, template);
		return me.create(template);
	}

	/**
	 * Retrieve template from given HTML text
	 * 
	 * @param {boolean} cached Set to true to auto cache if template does not exist
	 * @param {string} name Template name
	 * @param {string} template Template source
	 * @returns {HTMLTemplateElement} Template instance
	 */
	static loadHTMLTemplate(cached = false, name = '', tpl) {
		const me = GSCacheTemplate;
		const o = me.isHTMLTemplate(tpl);
		if (!o) return o;
		return me.initTemplate(cached, name, o);
	}

	/**
	 * Retrieve template from given URL
	 * 
	 * @async
	 * @param {boolean} cached Set to true to auto cache if template does not exist
	 * @param {string} name Template name
	 * @param {string} template Template source
	 * @returns {Promise<HTMLTemplateElement>} Template instance
	 */
	static async loadURLTemplate(cached = false, name = '', tpl) {
		const me = GSCacheTemplate;
		//const o = me.isURLTemplate(tpl);
		//if (!o) return o;
		const o = tpl;
		try {
			let template = null;
			if (cached) template = me.load(o);
			if (template) return template;
			template = await GSLoader.loadTemplate(o);
			return me.initTemplate(cached, name, template);
		} catch (e) {
			GSLog.error(me, e);
		}
		return false;
	}

	/**
	 * Retrieve template from given function
	 * 
	 * @async
	 * @param {boolean} cached Set to true to auto cache if template does not exist
	 * @param {string} name Template name
	 * @param {string} template Template source
	 * @returns {Promise<HTMLTemplateElement>} Template instance
	 */
	static async loadFunctionTemplate(cached = false, name = '', tpl) {
		const me = GSCacheTemplate;
		const fn = me.isFunctionTemplate(tpl);
		if (!fn) return fn;
		try {
			let template = null;
			if (me.cached) template = me.load(o);
			if (template) return template;
			template = GSFunction.isFunctionAsync(fn) ? await fn() : fn();
			return me.initTemplate(cached, name, template);
		} catch (e) {
			GSLog.error(me, e);
		}
		return fn;
	}

	/**
	 * Retrieve and cache html template for element
	 * 
	 * @async
	 * @param {boolean} cached Set to true to auto cache if template does not exist
	 * @param {string} name Template name
	 * @param {string} template Template source
	 * @returns {Promise<HTMLTemplateElement>} Template instance
	 */
	static async loadTemplate(cached = false, name = '', tpl) {

		if (!name) return false;
		if (!tpl) return false;

		const me = GSCacheTemplate;

		// try to load override template (by GSElement tag name)
		let template = false;

		if (tpl.indexOf('#') == 0) {
			//template = me.clone(document.getElementById(tpl.slice(1)));
			template = document.getElementById(tpl.slice(1));
			//template = template ? template.innerHTML : null;
		}

		if (!template) {
			template = me.loadHTMLTemplate(cached, name, tpl);
		}

		if (!template) {
			template = await me.loadFunctionTemplate(cached, name, tpl);
		}

		if (!template) {
			template = await me.loadURLTemplate(cached, name, tpl);
		}

		return template;
	}
}

/*
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * Dynamic template loader
 * @class
 * @extends {HTMLElement}
 */
class GSTemplate extends HTMLElement {

	#connected = false;
	#content = null;
	#observer = null;

	/**
	* List of observer element attributes
	*/
	static get observedAttributes() {
		return ['href'];
	}

	constructor() {
		super();
	}

	get id() {
		return GSAttr.get(this, 'id');
	}

	set id(val) {
		GSAttr.set(this, 'id', val);
	}

	get href() {
		return GSAttr.get(this, 'href');
	}

	set href(val) {
		GSAttr.set(this, 'href', val);
	}

	get isFlat() {
		return GSUtil.FLAT || GSAttr.getAsBool(this, 'flat', false);
	}

	get self() {
		return this.#content || this.shadowRoot;
	}

	/**
	 * Envrionment where to render component
	 *  - blank - always render
	 *  - mobile - only on mobile devices
	 *  - tablet - only on tablet devices
	 *  - desktop - only on desktop devices
	 */
	get environment() {
		return GSAttr.get(this, 'environment', '');
	}

	set environment(val) {
		GSAttr.set(this, 'environment', val);
	}

	/**
	 * Browser OS where to render component
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
	 */
	get browser() {
		return GSAttr.get(this, 'browser', '');
	}

	set browser(val) {
		GSAttr.set(this, 'browser', val);
	}

	/**
	 * Called when element attribute changed
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		const me = this;
		if (me.#connected && name === 'href') me.loadTemplate();
	}

	/**
	 * Called when element added to the DOM tree
	 */
	connectedCallback() {
		const me = this;
		const pe = me.parentElement;
		if (pe && pe.tagName == 'GS-ITEM') return;
		if (!(me.isValidEnvironment && me.isValidBrowser && me.isValidOS)) {
			return me.remove();
		}
		if (!me.id) me.id = GSID.id;
		me.#connected = true;
		GSComponents.store(me);
		me.loadTemplate();
	}

	/**
	 * Called when element removed from the DOM tree
	 */
	disconnectedCallback() {
		const me = this;
		me.#connected = false;
		me.#removeFlat();
		if (me.#observer) me.#observer.disconnect();
		GSComponents.remove(me);
		GSCacheTemplate.remove(me.id);
	}

	#removeFlat() {
		const me = this;
		if (me.#content) {
			me.#content.remove();
			me.#content = null;
		}
	}

	/**
	 * Returns if environment matched
	 * dektop, mobile, tablet, android, linux, winwdows, macos
	 * @return {boolean}
	 */
	get isValidEnvironment() {
		return GSEnvironment.isValidEnvironment(this.environment);
	}

	/**
	 * Check if valid OS to render
	 * @return {boolean}
	 */
	get isValidOS() {
		return GSEnvironment.isDevice(this.os);
	}

	/**
	 * Returns if browser matched, used to determine rendering/removal
	 * @return {boolean}
	 */
	get isValidBrowser() {
		return GSEnvironment.isValidBrowser(this.browser);
	}

	/**
	 * Retrieve or create element ShadowRoot 
	 * @return {ShadowRoot}
	 */
	get shadow() {
		const me = this;
		if (!me.shadowRoot && me.#connected) {
			me.attachShadow({ mode: 'open' });
			me.#observer = GSDOMObserver.create(me.shadowRoot);
		}
		return me.shadowRoot;
	}

	/**
	 * Load and instantiate HTML template that injects into element
	 * 
	 * @async
	 * @returns {Promise<HTMLTemplateElement>}
	 */
	async loadTemplate() {
		const me = this;
		const tpl = await GSCacheTemplate.loadTemplate(true, me.id, me.href);
		if (!tpl) {
			GSLog.error(this, `Template not found for: Id=${me.id}; href=${me.href}`);
			return false;
		}
		if (me.parentElement instanceof HTMLHeadElement) {
			GSEvent.sendSuspended(document, 'gs-template', { id: me.id, href: me.href });
			return tpl;
		}

		await GSEvent.waitAnimationFrame(async () => {
			if (!me.#connected) return;
			if (me.isFlat) {
				const body = GSDOM.parseWrapped(me, tpl.innerHTML);
				me.#content = me.insertAdjacentElement('afterend', body);
			} else {
				me.shadow.adoptedStyleSheets = GSCacheStyles.styles;
				GSDOM.setHTML(me.shadow, tpl.innerHTML);
			}
			GSEvent.sendSuspended(me, 'templateready', { id: me.id, href: me.href }, true, true);
		});
		return tpl;
	}

	/**
	 * Wait for template to be loded and parsed
	 * @param {string} href Tempalte url
	 * @returns {boolean} Loading and parsing status
	 */
	waitWhenReady(href = '') {
		const me = this;
		if (href) me.href = href;
		return me.waitEvent('templateready');
	}

	/**
	* Wait for event to happen
	* @param {string} name 
	* @returns  {boolean}
	*/
	waitEvent(name = '') {
		const me = this;
		return new Promise((r, e) => {
			if (!name) return e('Event undefined!');
			GSEvent.once(me, null, name, (e) => r(e.detail), { once: true });
		});
	}

	/**
	 * Find first element matched by selector
	 * @param {string} name CSS selector query
	 * @returns {HTMLElement}
	 */
	query(name = '') {
		return GSDOM.query(this, name);
	}

	/**
	 * Find all elements matched by selector
	 * @param {string} name CSS selector query
	 * @param {boolean} asArray  Return result wrapped as array
	 * @returns {Aray<HTMLElement>} List of HTMLElement matched
	 */
	queryAll(name = '', asArray = false) {
		return GSDOM.queryAll(this, name);
	}

	static {
		customElements.define('gs-template', GSTemplate);
		Object.seal(GSTemplate);
	}

}
