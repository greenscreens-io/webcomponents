/*
 * Copyright (C) 2015, 2021  Green Screens Ltd.
 */

/**
 * A module loading GSLink class
 * @module head/GSLink
 */

import GSBase from "./GSBase.mjs";

/**
 * Link element to load css src based on environment
 * To support custom components shared styling use shadow=true attribute
 * @class
 * @extends head/GSBase
 */
 export default class GSLink extends GSBase {

	/**
	 * Called every time node is added to parent node
	 */
	render() {

		const me = this;
		const el = document.createElement('link');

		el.async = me.async;
		el.defer = me.defer;
		el.rel = me.rel;
		el.type = me.type;
		el.href = me.url;
		el.nonce = me.nonce;

		if (me.shadow && el.rel === 'stylesheet') el.setAttribute('is', 'gs-linkext');

		return el;

	}

	get rel() {
		const me = this;
		let rel = me.getAttribute('rel') || '';
		if (!rel) {
			if (me.url.indexOf('.css')) {
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

