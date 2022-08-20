/*
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * A module loading GSTemplate class
 * @module templating/GSTemplate
 */

import GSCacheTemplate from "./GSCacheTemplate.mjs";
import GSCacheStyles from "../head/GSCacheStyles.mjs";
import GSDOMObserver from "../base/GSDOMObserver.mjs";
import GSComponents from "../base/GSComponents.mjs"
import GSUtil from "../base/GSUtil.mjs";
import GSLog from "../base/GSLog.mjs";
import GSID from "../base/GSID.mjs";

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
		return GSUtil.getAttribute(this, 'id');
	}

	set id(val) {
		GSUtil.setAttribute(this, 'id', val);
	}

	get href() {
		return GSUtil.getAttribute(this, 'href');
	}

	set href(val) {
		GSUtil.setAttribute(this, 'href', val);
	}

	get isFlat() {
		return GSUtil.FLAT || GSUtil.getAttributeAsBool(this, 'flat', false);
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
		return GSUtil.getAttribute(this, 'environment', '');
	}

	set environment(val) {
		GSUtil.setAttribute(this, 'environment', val);
	}

	/**
	 * Browser OS where to render component
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
	 */
	get browser() {
		return GSUtil.getAttribute(this, 'browser', '');
	}

	set browser(val) {
		GSUtil.setAttribute(this, 'browser', val);
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
		return GSUtil.isValidEnvironment(this.environment);
	}

	/**
	 * Check if valid OS to render
	 * @return {boolean}
	 */
	get isValidOS() {
		return GSUtil.isDevice(this.os);
	}

	/**
	 * Returns if browser matched, used to determine rendering/removal
	 * @return {boolean}
	 */
	get isValidBrowser() {
		return GSUtil.isValidBrowser(this.browser);
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
	 * @returns {HTMLTemplateElement}
	 */
	async loadTemplate() {
		const me = this;
		const tpl = await GSCacheTemplate.loadTemplate(true, me.id, me.href);
		if (!tpl) {
			GSLog.error(this, `Template not found for: Id=${me.id}; href=${me.href}`);
			return false;
		}
		if (me.parentElement instanceof HTMLHeadElement) {
			GSUtil.sendSuspendedEvent(document, 'gs-template', { id: me.id, href: me.href });
			return tpl;
		}

		await GSUtil.waitAnimationFrame(async () => {
			// const content = GSCacheTemplate.clone(tpl); // GSUtil.parse(tpl.innerHTML);
			if (!me.#connected) return;
			if (me.isFlat) {
				const slot = me.slot ? ` slot="${me.slot}" ` : '';
				const body = GSUtil.parse(`<gs-block ${slot} ref=${me.id}>${tpl.innerHTML}</gs-block>`);
				me.#content = me.insertAdjacentElement('afterend', body);
			} else {
				me.shadow.adoptedStyleSheets = GSCacheStyles.styles;
				me.shadow.innerHTML = tpl.innerHTML;
			}
			// GSUtil.walk(me.self, el => GSDOMObserver.parse(el));
			GSUtil.sendSuspendedEvent(me, 'templateready', { id: me.id, href: me.href });
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
			GSUtil.once(me, null, name, (e) => r(e.detail), { once: true });
		});
	}

	/**
	 * Find first element matched by selector
	 * @param {string} name CSS selector query
	 * @returns {HTMLElement}
	 */
	findEl(name = '') {
		return GSUtil.findEl(name, GSUtil.unwrap(this));
	}

	/**
	 * Find all elements matched by selector
	 * @param {string} name CSS selector query
	 * @param {boolean} asArray  Return result wrapped as array
	 * @returns {Aray<HTMLElement>} List of HTMLElement matched
	 */
	findAll(name = '', asArray = false) {
		return GSUtil.findAll(name, GSUtil.unwrap(this), asArray);
	}

	static {
		customElements.define('gs-template', GSTemplate);
	}

}
