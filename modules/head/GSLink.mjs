/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
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

		el.href = me.url;
		me.getAttributeNames().filter(v => v !== 'url').forEach(v => el.setAttribute(v, me.getAttribute(v)));

		if (me.shadow && el.rel === 'stylesheet') el.setAttribute('is', 'gs-ext-link');

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


