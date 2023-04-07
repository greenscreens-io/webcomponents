/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSCacheStyles class
 * @module head/GSCacheStyles
 */

import GSBase from "./GSBase.mjs";

/**
 * Cache for dyamically loaded styles.
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

		if (style && typeof style === 'string') {
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
	 * Get list of dynamic styles
	 * @returns {CSSStyleSheet}
	 */
	static get dynamic() {
		const me = GSCacheStyles;
		const id = 'gs-dynamic';
		let sheet = me.get(id);
		if (!sheet) {
			sheet = new CSSStyleSheet();		
			me.#store.set(id, sheet);
			document.adoptedStyleSheets = GSCacheStyles.styles;
		}
		return sheet;
	}	

	/**
	 * Get individual rule from dynamic styles cache
	 * @param {string} id 
	 * @returns {CSSRule}
	 */
	static getRule(id = '') {
		return Array.from(GSCacheStyles.dynamic.cssRules)
			.filter(v => v.selectorText === `.${id}`).pop();
	}

	/**
	 * Set dynamic element rule. Accepts string or json object representation
	 * @param {string} id 
	 * @param {string|object} style 
	 */
	static setRule(id = '', style = '', sync = false) {
		if (!(id && style)) return;
		let rule = GSCacheStyles.getRule(id);
		if (!rule) {
			GSCacheStyles.dynamic.insertRule(`.${id} {}`);
			return GSCacheStyles.setRule(id, style, sync);
		}

		let data = [];
		if (typeof style === 'string') {
			data = style.replaceAll('\n', '').split(';').map(v => v.trim().split(':')).filter(v => v.length === 2);
		} else {
			data = Object.entries(style);
		}
		
		if (sync) {
			data.forEach(kv => GSCacheStyles.#updateRule(rule, kv[0], kv[1]));
		} else {
			requestAnimationFrame(()=> {
				data.forEach(kv => GSCacheStyles.#updateRule(rule, kv[0], kv[1]));
			});
		}

		return rule;
	}

	static #updateRule(rule, prop = '', style = '') {
		style = style || '';
		const isImportant = style.indexOf('!important') > 0;
		style = style.replace('!important', '');
		prop = prop.trim();
		rule.style.setProperty(prop, style,  isImportant ? 'important' : '');
	}

	/**
	 * Remove dynamic element rule
	 * @param {string} id  
	 */
	static deleteRule(id = '') {
		Array.from(GSCacheStyles.dynamic.cssRules)
			.map((v, i) => v.selectorText === `.${id}` ? i : -1)
			.filter(v => v>-1)
			.forEach(v => GSCacheStyles.dynamic.deleteRule(v));
	}

	/**
	 * Return list of registered style sheets
	 * @returns {Array<CSSStyleSheet>}
	 */
	static get styles() {
		return Array.from(new Map([...GSCacheStyles.#store].sort((a, b) => String(a[0]).localeCompare(b[0]))).values());
	}

	/*
	* Inject CSS used by framework
	*/
	static injectStyle(css = '', hash = 0) {
		if (!css) return;
		try {
			hash = hash || GSBase.hashCode(css);
			GSCacheStyles.set(hash, css);
			document.adoptedStyleSheets = GSCacheStyles.styles;
		} catch (e) {
			console.log(e);
		}
	}

	static get #css() {
		return '.z-10k{z-index:10000 !important;}.gs-hide{display:none !important;}.gs-hide-orientation,.gs-render{display:none !important;}gs-item{display:none !important;}';
	}

	static {
		Object.freeze(GSCacheStyles);
		globalThis.GSCacheStyles = GSCacheStyles;
		GSCacheStyles.injectStyle(GSCacheStyles.#css);
	}
}
