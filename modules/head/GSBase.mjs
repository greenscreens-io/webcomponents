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
export default class GSBase extends HTMLElement {

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

				el.setAttribute('data-hash', hash);

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
		if (me.isAuto) {
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
	isMobile() {
		if (navigator.userAgentData) return navigator.userAgentData.mobile;
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}

	/**
	 * Check if matching schema
	 * @returns {boolean}
	 */
	isSchema() {
		const schema = this.schema;
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
	isAsset() {
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
				if (v.brand.toLowerCase().indexOf(strVal) > -1) {
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

		const isMobile = me.isMobile();
		const isAsset = me.isAsset();
		const isSchema = me.isSchema();
		const target = me.target;
		const env = me.env;

		if (!isSchema) return false;

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
		if (self.GS_DEV_MODE) {
			try {
				const base = url.startsWith('//') || url.startsWith('http') ? undefined : location.origin;
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
		let type = me.getAttribute('type') || ''
		if (!type) {
			if (me.url.indexOf('.js') > 0) {
				type = 'text/javascript';
			} else if (me.url.indexOf('.css') > 0) {
				type = 'text/css';
			}
		};
		return type;
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
	 * Retrieve https or https schema. 
	 * Used to filter under which schema loader element is applied
	 * @returns {string}
	 */
	get schema() {
		return this.getAttribute('schema') || '';
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

	static {
		Object.seal(GSBase);
	}

}

