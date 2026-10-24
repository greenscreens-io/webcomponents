/*
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * A module loading GSLinkExt class
 * @module head/GSLinkExt
 */

import GSBase from "./GSBase.mjs";
import GSCacheStyles from "./GSCacheStyles.mjs";
import GSLog from "../base/GSLog.mjs";

/**
 * Adoptable CSS - css template for WebComponents
 * Does not support style disabling / theming
 * @class
 * @extends HTMLLinkElement
 */
export default class GSLinkExt extends HTMLLinkElement {

	constructor() {
		super();
		const me = this;
		if (!me.order) me.order = GSBase.nextID();
	}

	connectedCallback() {
		const me = this;
		if (!me.isCSS) return;
		if (me.sheet) {
			me.#onLoad();
			return;
		}
		me.addEventListener('load', me.#onLoad, { once: true });
		me.addEventListener('error', me.#onError, { once: true });
	}

	disconnectedCallback() {
		const me = this;
		me.removeEventListener('load', me.#onLoad);
		me.removeEventListener('error', me.#onError);
		if (!me.isCSS) return;
		const sheet = GSCacheStyles.remove(me.order);
		GSBase.sendSuspendedEvent(document, 'gs-style', sheet);
	}

	#onLoad() {
		const me = this;
		const sheet = me.sheet;
		if (!sheet) return;
		me.removeEventListener('error', me.#onError);
		try {
			GSCacheStyles.adopt(me.asText, me.order);
			const proxy = GSCacheStyles.get(me.order);
			GSBase.sendSuspendedEvent(document, 'gs-style', proxy);
		} catch (e) {
			GSLog.error(me, e);
		}
	}

	#onError() {
		const me = this;
		me.removeEventListener('load', me.#onLoad);
		GSLog.error(me, `Failed to load stylesheet: ${me.href}`);
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
		return super.sheet;
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
