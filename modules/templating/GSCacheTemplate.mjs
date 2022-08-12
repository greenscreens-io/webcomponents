/*
 * © Green Screens Ltd., 2021.
 */

/**
 * A module loading GSCacheTemplate class
 * @module templating/GSCacheTemplate
 */

import GSLog from "../base/GSLog.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * Template cache to store loaded and preprocessed tempaltes for reuse
 * @class
 */
export default class GSCacheTemplate {

	static _store = new Map();

	static store(name, template) {
		this._store.set(name, template);
	}

	static remove(name) {
		return this._store.delete(name);
	}

	static load(name) {
		return this._store.get(name);
	}

	static getOrCreate(name, template) {
		const me = GSCacheTemplate;
		let el = me.load(name);
		if (el) return el;
		el = me.create(template);
		me.store(name, el);
		return el;
	}

	/*
	 * Create template element
	 */
	static create(template) {
		const el = document.createElement('template');
		el.innerHTML = template;
		return el;
	}

	/*
	 * Clone data from template element
	 */
	static clone(template) {
		if (!GSUtil.isTemplateElement(template)) return null;
		return template.content.cloneNode(true);
	}

	/*
	 * Check if template is retrieved from function
	 */
	static isFunctionTemplate(tpl) {
		const fn = GSUtil.parseFunction(tpl);
		return GSUtil.isFunction(fn) ? fn : false;
	}

	/*
	 * Check if template is retrieved from html code
	 */
	static isHTMLTemplate(tpl) {
		const val = tpl ? tpl.trim() : '';
		//return (val.startsWith('<') && val.endsWith('>')) ? tpl : false;
		return /^<(.*)>$/s.test(val) ? tpl : false;
	}

	/*
	 * Check if template is retrieved from URL
	 */
	static isURLTemplate(tpl) {
		const val = tpl ? tpl.trim() : '';
		return /^(https?:\/\/|.{0,2}\/{1,2})/i.test(val) ? tpl : false;
	}

	/*
	 * Check if template is retrieved from <template> with CSS selector
	 */
	static isTargetTemplate(tpl) {
		if (this.isURLTemplate(tpl)) return false;
		try {
			const el = tpl ? document.querySelector(tpl) : null;
			return GSUtil.isTemplateElement(el) ? el : false;
		} catch(e) {
			GSLog.error(this, e);
		}
		return false;
	}

	/*
	 * Initialize loaded template
	 */
	static initTemplate(cached = false, name = '', template) {
		const me = GSCacheTemplate;
		if (cached) return me.getOrCreate(name, template);
		return me.create(template);
	}

	/*
	 * Retrieve template from given HTML text
	 */
	static loadHTMLTemplate(cached = false, name = '', tpl) {
		const me = GSCacheTemplate;
		const o = me.isHTMLTemplate(tpl);
		if (!o) return o;
		return me.initTemplate(cached, name, o);
	}

	/*
	 * Load template from specified <template> element baed on css selector
	 */
	static loadTargetTemplate(tpl) {
		return GSCacheTemplate.isTargetTemplate(tpl);
	}

	/*
	 * Retrieve template from given URL
	 */
	static async loadURLTemplate(cached = false, name = '', tpl) {
		const me = GSCacheTemplate;
		const o = me.isURLTemplate(tpl);
		if (!o) return o;
		try {
			let template = null;
			if (cached) template = me.load(o);
			if (template) return template;
			template = await GSUtil.load(o);
			return me.initTemplate(cached, name, template);
		} catch(e) {
			GSLog.error(me, e);
		}
		return false;
	}

	/*
	 * Retrieve template from given function
	 */
	static async loadFunctionTemplate(cached = false, name = '', tpl) {
		const me = GSCacheTemplate;
		const fn = me.isFunctionTemplate(tpl);
		if (!fn) return fn;
		try {
			let template = null;
			if (me.cached) template = me.load(o);
			if (template) return template;
			template = GSUtil.isFunctionAsync(fn) ? await fn() : fn();
			return me.initTemplate(cached, name, template);
		} catch(e) {
			GSLog.error(me, e);
		}
		return fn;
	}

	/*
	 * Retrieve and cache html template for element
	 */
	static async loadTemplate(cached = false, name = '', tpl) {

		if (!name) return false;
		if (!tpl) return false;
		
		const me = GSCacheTemplate;

		// try to load override template (by GSElement tag name)
		let template = false;
		
		if (tpl.indexOf('#') !== 0) {
			template = me.loadHTMLTemplate(cached, name, tpl);
		}
				
		if (!template) {
			template = me.loadTargetTemplate(tpl);
		}

		if (!template) {
			template = await me.loadFunctionTemplate(cached, name, tpl);
		}

		if (!template) {
			template = await me.loadURLTemplate(cached, name, tpl);
		}

		return template;
	}
}
