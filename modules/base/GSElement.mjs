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
//import GSDOMObserver from "./GSDOMObserver.mjs";
import GSEvent from "./GSEvent.mjs";
import GSComponents from "./GSComponents.mjs";
import GSCacheStyles from "../head/GSCacheStyles.mjs";
import GSLog from "./GSLog.mjs";
import GSFunction from "./GSFunction.mjs";
import GSData from "./GSData.mjs";
import GSEnvironment from "./GSEnvironment.mjs";
import GSDOM from "./GSDOM.mjs";

/**
 * Base element inherited by all other registered GS-Elements
 * Contains main rendering logic
 * @class
 * @extends HTMLElement
 */
export default class GSElement extends HTMLElement {

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
	 * @returns {string}  Vlues parent|self|unwrap|[html insertion position]
	 */
	get anchor() {
		const me = this;
		const dft = 'beforeend@self';
		return me.proxy ? dft : GSAttr.get(this, 'anchor', dft);
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

	/**
	 * Avaialble only after render, after template is applied
	 * @returns {ShadowRoot|HTMLElement} 
	 */
	get self() {
		const me = this;
		return me.isProxy && GSDOM.isGSElement(me.#content) ? me.#content.self : me.#content;
	}

	/**
	 * Update shareable stylesheet on change
	 */
	updateUI() {
		const me = this;
		if (me.shadowRoot) me.shadowRoot.adoptedStyleSheets = GSCacheStyles.styles;
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
	getEl(name = '') {
		const me = this.self;
		return me && me.id == name ? me : GSDOM.getEl(name, this.self);
	}

	/**
	 * Find element by CSS selector (top level is this element)
	 * @param {string} name 
	 * @returns {HTMLElement}
	 */
	findEl(name = '') {
		const me = this.self;
		return me && me.matches && me.matches(name) ? me : GSDOM.findEl(name, this.self);
	}

	/**
	 * Find multiple elements by CSS selector (top level is this element)
	 * @param {string} name 
	 * @returns {HTMLElement}
	 */
	findAll(name = '', asArray = false) {
		return GSDOM.findAll(name, this.self, asArray);
	}

	/**
	 * Used for override to get predefined template
	 * Can be html source or url, checks if load or not
	 * @returns {string}
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
	 * @param {string} name 
	 * @returns {void}
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
	 * Called when element injected to parent DOM node
	 */
	connectedCallback() {
		const me = this;

		if (me.#isConfig()) return;

		if (!(me.isValidEnvironment && me.isValidBrowser && me.isValidOS)) {
			return me.remove();
		}

		me.#opts = me.#injection();
		me.#proxied = me.#opts.ref;

		if (!me.id) me.setAttribute('id', GSID.id);
		GSComponents.store(me);
		me.#render();
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
			requestAnimationFrame(() => {
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
	 * Update UI state if orientation changes
	 */
	#onOrientation(e) {
		const me = this;
		requestAnimationFrame(() => {
			if (me.offline) return;
			me.isValidOrientation ? me.show(true) : me.hide(true)
		});
	}

	#isConfig() {
		const me = this;
		let pe = me.parentElement;
		if (pe && pe.tagName == 'GS-ITEM') return true;
		pe = GSComponents.getOwner(me, 'GS-ITEM');
		if (pe && pe.tagName == 'GS-ITEM') return true;
		pe = GSComponents.getOwner(me, GSElement);
		return pe && pe.isProxy;
	}

	#styleChange() {
		const me = this;
		requestAnimationFrame(() => {
			me.updateUI();
		});
	}

	get #useTemplate() {
		const me = this;
		return (me.#proxied && me.isFlat) || !me.#proxied;
	}

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
					const tpl = GSDOM.parseWrapped(me, src, false);
					me.#content = tpl;
					GSDOM.insertAdjacent(inject.target, tpl, inject.anchor);
				} else {
					me.#content = me.#shadow;
					me.#content.innerHTML = src;
					me.updateUI();
				}
				return;
			}


			if (inject.target === me.parentElement) {
				me.#content = me.isFlat ? me : me.#shadow;
				me.#content.innerHTML = src;
				me.updateUI();
				return;
			}

			me.#content = GSDOM.parseWrapped(me, src, true);
			GSDOM.link(me, me.#content);
			GSDOM.insertAdjacent(inject.target, me.#content, inject.anchor);

		});
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
				el = GSComponents.query(target);
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
	 * @returns {void}
	 */
	async #render() {
		const me = this;
		// await GSFunction.waitPageLoad();
		await me.#aplyTemplate();
		if (me.offline) return;
		if (!me.#useTemplate) return;
		if (!me.isFlat) me.attachEvent(this, document, 'gs-style', me.#styleChange.bind(me));
		me.attachEvent(this, screen.orientation, 'change', me.#onOrientation.bind(me));
		requestAnimationFrame(() => me.onReady());
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
		GSEvent.send(me, 'componentready', me.id, true, true);
	}

}


