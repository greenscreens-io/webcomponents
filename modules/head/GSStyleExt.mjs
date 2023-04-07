/*
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * A module loading GSStyleExt class
 * @module head/GSStyleExt
 */

import GSBase from "./GSBase.mjs";
import GSCacheStyles from "./GSCacheStyles.mjs";

/**
 * Adoptable CSS - css template for WebComponents
 * Does not support style disabling / theming
 * @class
 * @extends HTMLStyleElement
 */
export default class GSStyleExt extends HTMLStyleElement {

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
		clearInterval(me.#callback);
		const sheet = GSCacheStyles.remove(me.order);
		GSBase.sendSuspendedEvent(document, 'gs-style', sheet);
	}

	#onLoad() {
		const me = this;
		const sheet = me.sheet;
		if (!sheet) return;
		clearInterval(me.#callback);
		GSCacheStyles.adopt(me.asText, me.order);
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

