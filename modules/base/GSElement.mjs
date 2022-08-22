/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSElement class
 * @module base/GSElement
 */

import GSID from "./GSID.mjs";
import GSUtil from "./GSUtil.mjs";
import GSLoader from "./GSLoader.mjs";
//import GSDOMObserver from "./GSDOMObserver.mjs";
import GSEvent from "./GSEvent.mjs";
import GSComponents from "./GSComponents.mjs";
import GSCacheStyles from "../head/GSCacheStyles.mjs";
import GSLog from "./GSLog.mjs";
import GSFunction from "./GSFunction.mjs";
import GSData from "./GSData.mjs";
import GSEnvironment from "./GSEnvironment.mjs";

/**
 * Base element inherited by all other registered GS-Elements
 * Contains main rendering logic
 * @class
 * @extends HTMLElement
 */
export default class GSElement extends HTMLElement {

	#removed = false;
	#content = null;
	#observer = null;

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
		return GSUtil.getAttribute(this, 'template', '');
	}

	set template(val) {
		GSUtil.setAttribute(this, 'template', val);
	}

	/**
	 * Return if this component uses shadow DOM or flat - directly injected into a page
	 * If set to true, use anchor attribute to determine where to inject
	 * @returns {boolean} 
	 */
	get isFlat() {
		return GSUtil.FLAT || GSUtil.getAttributeAsBool(this, 'flat');
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
		return GSUtil.getAttribute(this, 'environment', '');
	}

	set environment(val) {
		GSUtil.setAttribute(this, 'environment', val);
	}

	/**
	 * Browser OS where to render component
	 * @returns {string} 
	 */
	get os() {
		return GSUtil.getAttribute(this, 'os', '');
	}

	set os(val) {
		GSUtil.setAttribute(this, 'os', val);
	}

	/**
	 * Browser type, if not matched do not render
	 * chrome, edge, ie, firefox, ...
	 * @returns {string} 
	 */
	get browser() {
		return GSUtil.getAttribute(this, 'browser', '');
	}

	set browser(val) {
		GSUtil.setAttribute(this, 'browser', val);
	}

	/**
	 * Orientation where to render component
	 *  - blank - always render
	 *  - vertical | portrait
	 *  - horizontal | landscape
	 * @returns {string} 
	 */
	get orientation() {
		return GSUtil.getAttribute(this, 'orientation', '');
	}

	set orientation(val) {
		GSUtil.setAttribute(this, 'orientation', val);
	}

	/**
	 * Function to be called when component is ready.
	 * NOTE: namespace is supported also
	 * @returns {string}  Functio name
	 */
	get onready() {
		return GSUtil.getAttribute(this, 'onready', '');
	}

	set onready(val) {
		GSUtil.setAttribute(this, 'onready', val);
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
	 * Where to position flat element
	 * HTML insertAdjacent value or *(gs-block) or self(within)
	 * Format position | position@target
	 * @returns {string}  Vlues parent|self|unwrap|[html insertion position]
	 */
	get anchor() {
		return GSUtil.getAttribute(this, 'anchor', 'afterend');
	}

	/**
	 * Get element shadowRoot, autocreate if does not exist
	 * @returns {ShadowRoot} 
	 */
	get shadow() {
		const me = this;
		if (!me.shadowRoot) {
			me.attachShadow({ mode: 'open' });
			me.#observer = GSDOMObserver.create(me.shadowRoot);
			me.updateUI();
		}
		return me.shadowRoot;
	}

	/**
	 * Avaialable only after render, after template is applied
	 * @returns {ShadowRoot|HTMLElement} 
	 */
	get self() {
		const me = this;
		if (!me.isFlat) return me.shadow;
		return me.anchor.indexOf("unwrap") === 0 ? me.#content.parentElement : me.#content;
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
		return GSUtil.getAttribute(this, 'style', '');
	}

	/**
	 * Find element by its ID
	 * @param {string} name 
	 * @returns {HTMLElement}
	 */
	getEl(name = '') {
		return GSUtil.getEl(name, this.self);
	}

	/**
	 * Find element by CSS selector (top level is this element)
	 * @param {string} name 
	 * @returns {HTMLElement}
	 */
	findEl(name = '') {
		return GSUtil.findEl(name, this.self);
	}

	/**
	 * Find multiple elements by CSS selector (top level is this element)
	 * @param {string} name 
	 * @returns {HTMLElement}
	 */
	findAll(name = '', asArray = false) {
		return GSUtil.findAll(name, this.self, asArray);
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
		GSUtil.hide(this, orientation);
	}

	/**
	 * Show current component
	 * @param {boolean} orientation 
	 */
	show(orientation = false) {
		GSUtil.show(this, orientation);
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
		if (me.shadowRoot || (me.isFlat && me.firstElementChild)) {
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
		return (pe && pe.tagName == 'GS-ITEM');
	}

	#styleChange() {
		const me = this;
		requestAnimationFrame(() => {
			me.updateUI();
		});
	}

	async #aplyTemplate() {

		const me = this;

		if (me.offline) return;

		const src = await me.getTemplate(me.template);
		if (!src) return;

		await GSEvent.waitAnimationFrame(() => {

			if (me.offline) return;

			if (!me.isFlat) {
				me.shadow.adoptedStyleSheets = GSCacheStyles.styles;
				me.shadow.innerHTML = src;
				return;
			}

			let tpl = null;
			const inject = me.#injection();

			if (inject.target) {
				const ip = GSComponents.query(inject.target);
				if (ip) {
					tpl = me.#body(src, false);
					me.#content = ip.insertAdjacentElement(inject.anchor, tpl);
				} else {
					GSLog.warn(me, 'Injection point not available for flat component!');
					GSLog.warn(me, `Element: ${me.tagName}, Id:${me.id}, tgt:${inject.target}`);
				}
				return;
			}

			if (inject.anchor === 'parent') {
				tpl = me.#body(src, false);
				me.#content = me.parentElement.insertAdjacentElement('beforeend', tpl);
			} else if (inject.anchor === 'self') {
				me.innerHTML = src;
				me.#content = me;
			} else if (inject.anchor === 'unwrap') {
				tpl = me.#body(src, true);
				me.#content = me.insertAdjacentElement('afterend', tpl);
			} else {
				tpl = me.#body(src, false);
				me.#content = me.insertAdjacentElement(me.anchor, tpl);
			}

		});
	}

	#body(src = '', unwrap = false) {
		const me = this;

		if (unwrap) {
			const tpl = GSUtil.parse(src);
			GSUtil.setAttribute(tpl, 'ref', me.id);
			if (me.slot) GSUtil.setAttribute(tpl, 'slot', me.slot);
			return tpl;
		}

		const slot = me.slot ? ` slot="${me.slot}" ` : '';
		return GSUtil.parse(`<gs-block ${slot} ref=${me.id}>${src}</gs-block>`);
	}

	#injection() {
		const me = this;
		const anchor = me.anchor;
		const p = anchor.indexOf('@');
		return {
			anchor: p > 0 ? anchor.slice(0, p) : anchor,
			target: p > 0 ? anchor.slice(p + 1) : null
		};
	}

	#removeFlat() {
		const me = this;
		if (me.#content) {
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
		me.attachEvent(this, document, 'gs-style', me.#styleChange.bind(me));
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
		const fn = GSFunction.parseFunction(me.onready);
		GSFunction.callFunction(fn);
		GSEvent.send(me, 'componentready', me.id, true, true);
	}

}


