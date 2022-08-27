/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSCacheStyles class
 * @module head/GSCacheStyles
 */

import GSBase from "./GSBase.mjs";

/**
 * Cache for dyamically laoded styles.
 * Used to sharestyles among GS-* WebComponents
 * @class
 */
export default class GSCacheStyles {

	static #store = new Map();

	/**
	 * Store initialized stylesheet under the unique ID
	 * @param {string} id 
	 * @param {CSSStyleSheet} style 
	 * @returns {CSSStyleSheet} Stored stylesheet
	 */
	static set(id, style) {
		const me = this;
		if (style instanceof CSSStyleSheet) {
			me.#store.set(id, style);
		}

		if (typeof style === 'string') {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(style);
			me.#store.set(id, sheet);
		}

		return me.get(id);

	}

	/**
	 * Remove stylesheet by unique ID
	 * @param {string} id 
	 * @returns {boolean}
	 */
	static remove(id) {
		return this.#store.delete(id);
	}

	/**
	 * Retrieve stylesheet by unique ID
	 * @param {string} id 
	 * @returns {boolean}
	 */
	static get(id) {
		return this.#store.get(id);
	}

	/**
	 * Retrieve CSSStyleSheet by ID, and automatically store in cache if does not exist
	 * @param {string} id Unique stylesheed id
	 * @param {CSSStyleSheet} style 
	 * @returns {boolean}
	 */
	static getOrSet(id, style) {
		if (style && style.cssRules.length === 0) return;
		const me = GSCacheStyles;
		const el = me.get(id);
		if (el) return el;
		return me.set(id, style);
	}

	/**
	 * Return lsit of registered style sheets
	 * @returns {Array<CSSStyleSheet>}
	 */
	static get styles() {
		return Array.from(new Map([...GSCacheStyles.#store].sort((a, b) => String(a[0]).localeCompare(b[0]))).values());
	}

	/*
	* Inject special CSS used by framework
	*/
	static injectStyle(css = '', hash = 0) {
		if (!css) return;
		try {
			hash = hash || GSBase.hashCode(css);
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(css);
			GSCacheStyles.getOrSet(hash, sheet);
			document.adoptedStyleSheets = GSCacheStyles.styles;
		} catch (e) {
			console.log(e);
		}
	}

	static {
		Object.freeze(GSCacheStyles);
		window.GSCacheStyles = GSCacheStyles;
		const style = '.gs-hide{display:none;}.gs-hide-orientation,.gs-render{display:none !important;}gs-item{display:none !important;}';
		GSCacheStyles.injectStyle(style);
	}
}

