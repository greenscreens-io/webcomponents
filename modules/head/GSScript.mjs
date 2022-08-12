/*
 * Copyright (C) 2015, 2020  Green Screens Ltd.
 */

/**
 * A module loading GSLinkExt class
 * @module head/GSLinkExt
 */

import GSBase from "./GSBase.mjs";

/**
 * Script element to load src based on environment
 * @class
 * @extends head/GSBase
 */
export default class GSScript extends GSBase {

	/**
	 * Called every time node is added to parent node
	 */
	render() {

		const me = this;
		const el = document.createElement('script');

		el.async = me.async;
		el.defer = me.defer;
		el.type = me.type;
		el.src = me.url;
		el.nonce = me.nonce;

		return el;

	}

	static {
		customElements.define('gs-script', GSScript);		
		Object.freeze(GSScript);
	}

}
