/*
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * A module loading GSLinkExt class
 * @module head/GSLinkExt
 */

import GSBase from "./GSBase.mjs";
import GSCacheStyles from "./GSCacheStyles.mjs";

/**
 * Adoptable CSS - css template for WebComponents
 * Does not support style disabling / theming
 * @class
 * @extends HTMLLinkElement
 */
export default class GSLinkExt extends HTMLLinkElement {

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
		GSCacheStyles.injectStyle(me.asText, true, me.order);
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

	get isCSS() {
		const me = this;
		return me.rel === 'stylesheet' || me.href.indexOf('\.css') > 0;
	}

	get order() {
		return this.getAttribute('order');
	}

	set order(val = '') {
		return this.setAttribute('order', val);
	}

	static {
		customElements.define('gs-linkext', GSLinkExt, { extends: 'link' });
		Object.freeze(GSLinkExt);
	}	
}
