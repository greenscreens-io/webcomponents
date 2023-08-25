/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSElement class
 * @module base/GSElement
 */

import GSID from "./GSID.mjs";
import GSUtil from "./GSUtil.mjs";
import GSAttr from "./GSAttr.mjs";
import GSLoader from "./GSLoader.mjs";
import GSEvents from "./GSEvents.mjs";
import GSComponents from "./GSComponents.mjs";
import GSCacheStyles from "../head/GSCacheStyles.mjs";
import GSLog from "./GSLog.mjs";
import GSFunction from "./GSFunction.mjs";
import GSData from "./GSData.mjs";
import GSEnvironment from "./GSEnvironment.mjs";
import GSDOM from "./GSDOM.mjs";
import GSDOMObserver from './GSDOMObserver.mjs';

/**
 * Base element inherited by all other registered GS-Elements
 * Contains main rendering logic
 * @class
 * @extends HTMLElement
 */
export default class GSElement extends HTMLElement {

	#childs = 0;
	#ready = false;
	#removed = false;
	#content = null;
	#observer = null;

	#proxied = false;
	#opts = null;


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
		return ['orientation', 'id', 'visible'];
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
	 * Is proxied HTML wrapped in GS-block
	 */
	get isWrap() {
        return true;
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
		return GSAttr.get(this, 'proxy');
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
	 * Available only after render, after template is applied
	 * @returns {ShadowRoot|HTMLElement} 
	 */
	get self() {
		const me = this;
		/*
		if (me.isProxy) return me.#content instanceof GSElement ? me.#content.self : me.#content;
		return me.querySelector('[slot]:not(template),:not(gs-item)') ? me : me.#content;
		*/
		return me.isProxy && me.#content instanceof GSElement ? me.#content.self : me.#content;
	}

	/**
	 * Check element visibility
	 */
	get visible() {
		return this.hasAttribute('visible');
	}

	/**
	 * Set element visibility
	 */
	set visible(val = true) {
		GSAttr.setAsBool(this, 'visible', val);
	}

	get unstyled() {
		return this.hasAttribute('unstyled');
	}

	/**
	 * Update shareable stylesheet on change
	 */
	updateUI() {
		const me = this;
		if (!me.shadowRoot) return;
		if (me.unstyled) return;
		me.shadowRoot.adoptedStyleSheets = GSCacheStyles.styles;
		GSEvents.send(document.body, 'i18n', me.shadowRoot);
	}

	/**
	 * Retrieve custom style for rendered items, does not apply to this element.
	 * @returns {string}
	 */
	getStyle() {
		return GSAttr.get(this, 'style', '');
	}

	/**
	 * Element dynamic style id
	 */
	get styleID() {
		return `${this.tagName}-${this.id}`.toLocaleLowerCase();
	}

	#createStyleClass() {
		const me = this;
		GSCacheStyles.deleteRule(me.styleID);
		GSCacheStyles.setRule(me.styleID, me.getStyle());
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
	query(query = '', shadow = false) {
		const me = this;
		const el = GSDOM.query(me.self, query, false, true);
		if (me.isProxy || el) return el;
		return GSDOM.query(me, query, false, shadow);
	}

	/**
	 * Find multiple elements by CSS selector (top level is this element)
	 * @param {string} query 
	 * @returns {Array<HTMLElement>}
	 */
	queryAll(query = '', shadow = false) {
		const me = this;
		const list = GSDOM.queryAll(me.self, query, false, true);
		if (me.isProxy || list.length > 0) return list;
		return GSDOM.queryAll(me, query, false, shadow);
	}

	/**
	 * Used for override to get predefined template
	 * Can be html source or url, checks if load or not
	 * @async
	 * @returns {Promisa<string>}
	 */
	async getTemplate(def = '') {
		if (def) return GSLoader.getTemplate(def);
		const el = this.query('template');
		return el ? el.innerHTML : '';
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
	waitEvent(name = '') {
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
		return GSEvents.attach(this, el, name, fn, once);
	}

	/**
	* Generic event listener remove
	* @param {HTMLElement} el Element on which to monitor for named events
	* @param {string} name Event name to watch for
	* @param {Function} fn Event trigger callback
	* @returns {boolean} State if attachment was successful	
	*/
	removeEvent(el, name = '', fn) {
		return GSEvents.remove(this, el, name, fn);
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

		GSID.setIf(me);
		me.#opts = me.#injection();
		me.#proxied = me.#opts.ref;
		GSComponents.store(me);
		me.attachEvent(me, 'childrender', me.#onChildRender.bind(me));
		me.attachEvent(me, 'childready', me.#onChildReady.bind(me));
		GSEvents.send(me.owner, 'childrender', me);
		requestAnimationFrame(() => me.#render());
	}

	/**
	 * Called when element removed from parent DOM node
	 */
	disconnectedCallback() {
		const me = this;
		me.#removed = true;
		me.#observer?.disconnect();
		GSComponents.remove(me);
		GSEvents.deattachListeners(me);
		GSCacheStyles.deleteRule(me.styleID);
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
		if (name === 'visible') {
			GSDOM.toggleClass(me, 'gs-hide', newValue === 'false');
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
		GSEvents.send(this.owner, 'childready');
	}

	async onBeforeReady() {
	}

	async #doReady() {
		const me = this;
		if (me.#childs > 0) return;
		if (me.#ready) return;
		if (me.offline) return;
		me.#ready = true;
		me.removeEvent(me, 'childrender');
		me.removeEvent(me, 'childready');
		await me.onBeforeReady();
		try {
			const fn = GSFunction.parseFunction(me.onready);
			GSFunction.callFunction(fn);
			GSEvents.send(me, 'ready');
			GSEvents.send(document.body, 'componentready', me);
		} finally {
			me.onReady();
		}
	}

	#onChildRender(e) {
		const me = this;
		if (this !== e.srcElement) me.#childs++;
	}

	#onChildReady(e) {
		const me = this;
		if (!e) return;
		if (me === e.srcElement) return;
		if (me.#childs > 0) {
			me.#childs--;
		} else return;
		if (me.#childs == 0) me.#doReady();
	}

	/**
	 * Update UI state if orientation changes
	 */
	#onOrientation(e) {
		const me = this;
		GSUtil.requestAnimationFrame(() => {
			if (me.offline) return;
			me.isValidOrientation ? me.show(true) : me.hide(true)
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
	async #applyTemplate() {

		const me = this;

		if (me.offline) return;

		const useTpl = me.#useTemplate;
		const src = useTpl ? await me.getTemplate(me.template) : me.outerHTML;

		await GSEvents.waitAnimationFrame(() => {

			if (me.offline) return;

			me.#createStyleClass();
			const inject = me.#opts;

			if (me.#proxied) {
				if (useTpl) {
					me.#content = me.isWrap ? GSDOM.parseWrapped(me, src, true) : GSDOM.parse(src, true);
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
				el = GSDOM.query(me.owner, target) || GSDOM.query(document.documentElement, target);
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
		// await GSEvents.waitPageLoad();
		await me.#applyTemplate();
		try {
			if (me.offline) return;
			if (!me.#useTemplate) return;
			if (!me.isFlat) me.attachEvent(document, 'gs-style', me.#styleChange.bind(me));
			me.attachEvent(screen.orientation, 'change', me.#onOrientation.bind(me));
		} finally {
			GSUtil.requestAnimationFrame(() => me.#doReady());
		}
	}

	/**
	 * Generic safe component define
	 * @param {*} name 
	 * @param {*} clazz 
	 * @param {*} opt 
	 * @returns 
	 */
	 static define(name, clazz, opt) {
		if (customElements.get(name)) return;
		if (customElements.GSDefine) return customElements.GSDefine(name, clazz, opt);
		return customElements.define(name, clazz, opt);
	}
	
	static {
		customElements.define('gs-element', GSElement);
		if (!customElements.GSDefine) {
			customElements.GSDefine = customElements.define;
			customElements.define = GSElement.define;
			Object.freeze(customElements);
		}		
	}
}

