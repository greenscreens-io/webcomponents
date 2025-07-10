/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSCacheStyles class
 * @module head/GSCacheStyles
 */

import { GSDynamicStyle } from "./GSDynamicStyle.mjs";
import { GSID } from "./GSID.mjs";
import { GSLog } from "./GSLog.mjs";

import { gsstyles } from "./style.mjs";

/**
 * Cache for dynamically loaded styles.
 * Used to share styles among GS-* WebComponents
 * @class
 */
export class GSCacheStyles {

	static #store = new Map();

	/**
	 * Create a new CSSStyleSheet
	 * @param {String} id Unique ID
	 * @returns {CSSStyleSheet} Created instance
	 */
	static create(id) {
		const sheet = new GSDynamicStyle(id);
		this.#store.set(id, sheet);
		return sheet;
	}

	/**
	 * Store initialized stylesheet under the unique ID
	 * @param {String} id 
	 * @param {CSSStyleSheet} style 
	 * @returns {CSSStyleSheet} Stored stylesheet
	 */
	static set(id, style) {

		const me = this;

		if (style instanceof CSSStyleSheet) {
			me.#store.set(id, style);
		}

		if (style && typeof style === 'string') {
			const sheet = GSCacheStyles.create(id);
			sheet.replaceSync(style);
		}

		return me.get(id);

	}

	/**
	 * Remove stylesheet by unique ID
	 * @param {String} id 
	 * @returns {Boolean}
	 */
	static remove(id) {
		return this.#store.delete(id);
	}

	/**
	 * Retrieve stylesheet by unique ID
	 * @param {String} id 
	 * @returns {CSSStyleSheet}
	 */
	static get(id) {
		return this.#store.get(id);
	}

	/**
	 * Get list of dynamic styles
	 * @returns {CSSStyleSheet}
	 */
	static get dynamic() {

		const me = GSCacheStyles;
		const id = 'gs-dynamic';
		
		let sheet = me.get(id);
		if (!sheet) {
			sheet = GSCacheStyles.create(id);
			document.adoptedStyleSheets = GSCacheStyles.styles;
		}
		
		return sheet;
	}

	/**
	 * Get individual rule from dynamic styles cache
	 * @param {String} id 
	 * @returns {CSSRule}
	 */
	static getRule(id = '') {
		return GSCacheStyles.dynamic.getRule(id);
	}

	/**
	 * Set dynamic element rule. Accepts string or json object representation
	 * @param {String} id 
	 * @param {string|object} style 
	 */
	static setRule(id = '', style = '', sync = false) {
		return GSCacheStyles.dynamic.setRule(id, style, sync);
	}

	/**
	 * Remove dynamic element rule
	 * @param {String} id  
	 */
	static deleteRule(id = '') {
		GSCacheStyles.dynamic.deleteRule(id);
	}

	/**
	 * Return list of registered style sheets
	 * @returns {Array<CSSStyleSheet>}
	 */
	static get styles() {
		return Array.from(new Map([...GSCacheStyles.#store].sort((a, b) => String(a[0]).localeCompare(b[0]))).values());
	}

	/**
	 * Inject CSS used by framework across all shadows
	 * @param {string} css CSS string to inject
	 * @param {number} [hash=0] Optional hash for the style
	 */
	static adopt(css = '', hash = 0) {
		if (!css) return;
		try {
			hash = hash || GSID.hashCode(css);
			GSCacheStyles.set(hash, css);
			document.adoptedStyleSheets = GSCacheStyles.styles;
		} catch (e) {
			GSLog.error(null, e);
		}
	}

	static {
		Object.freeze(GSCacheStyles);
		globalThis.GSCacheStyles = GSCacheStyles;
		GSCacheStyles.adopt(gsstyles);
	}
}
