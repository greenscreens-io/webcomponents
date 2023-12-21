/*
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * A module loading GSCacheTemplate class
 * @module templating/GSCacheTemplate
 */

import GSDOM from "../base/GSDOM.mjs";
import GSFunction from "../base/GSFunction.mjs";
import GSLoader from "../base/GSLoader.mjs";
import GSLog from "../base/GSLog.mjs";

/**
 * Template cache to store loaded and preprocessed templates for reuse
 * @class
 */
export default class GSCacheTemplate {

	static #store = new Map();

	/**
	 * Store pre-processed template into a cache under given name. 
	 * Name is usually a path to a template.
	 * @param {string} name Name of a template
	 * @param {HTMLTemplateElement} template Preprocessed template
	 */
	static store(name, template) {
		this.#store.set(name, template);
	}

	/**
	 * Remove template from cache
	 * @param {string} name Name of a template
	 * @returns {boolean}
	 */
	static remove(name) {
		return this.#store.delete(name);
	}

	/**
	 * Get template from cache by it's name.
	 * @param {*} name Name of a template
	 * @returns {HTMLTemplateElement}
	 */
	static load(name) {
		return this.#store.get(name);
	}

	/**
	 * Helper function to retrieve alreaady existing template by name,
	 *  or inject a new one if does not exists already and return template instance.
	 * @param {string} name 
	 * @param {string} template 
	 * @returns {HTMLTemplateElement}
	 */
	static getOrCreate(name, template) {
		const me = GSCacheTemplate;
		let el = me.load(name);
		if (el) return el;
		el = me.create(template);
		me.store(name, el);
		return el;
	}

	/**
	 * Create template element from loaded template source
	 * 
	 * @param {string} template 
	 * @returns {HTMLTemplateElement}
	 */
	static create(template) {
		const el = document.createElement('template');
		GSDOM.setHTML(el, template);
		return el;
	}

	/**
	 * Clone data from template element
	 * 
	 * @param {HTMLTemplateElement} template 
	 * @returns {HTMLTemplateElement}
	 */
	static clone(template) {
		return GSDOM.isTemplateElement(template) ? template.content.cloneNode(true) : null;
	}

	/**
	 * Check if template is retrieved from function
	 * 
	 * @param {string} tpl 
	 * @returns {boolean}
	 */
	static isFunctionTemplate(tpl) {
		const fn = GSFunction.parseFunction(tpl);
		return GSFunction.isFunction(fn) ? fn : false;
	}

	/**
	 * Check if template is retrieved from html code
	 * 
	 * @param {string} tpl 
	 * @returns {boolean}
	 */
	static isHTMLTemplate(tpl) {
		const val = tpl ? tpl.trim() : '';
		//return (val.startsWith('<') && val.endsWith('>')) ? tpl : false;
		return /^<(.*)>$/s.test(val) ? tpl : false;
	}

	/**
	 * Check if template is retrieved from URL
	 * 
	 * @param {string} tpl 
	 * @returns {boolean}
	 */
	static isURLTemplate(tpl) {
		const val = tpl ? tpl.trim() : '';
		return /^(https?:\/\/|.{0,2}\/{1,2})/i.test(val) ? tpl : false;
	}

	/**
	 * Initialize loaded template
	 * 
	 * @param {boolean} cached Set to true to auto cache if template does not exist
	 * @param {string} name Template name
	 * @param {string} template Template source
	 * @returns {HTMLTemplateElement} Template instance
	 */
	static initTemplate(cached = false, name = '', template) {
		const me = GSCacheTemplate;
		if (cached) return me.getOrCreate(name, template);
		return me.create(template);
	}

	/**
	 * Retrieve template from given HTML text
	 * 
	 * @param {boolean} cached Set to true to auto cache if template does not exist
	 * @param {string} name Template name
	 * @param {string} template Template source
	 * @returns {HTMLTemplateElement} Template instance
	 */
	static loadHTMLTemplate(cached = false, name = '', tpl) {
		const me = GSCacheTemplate;
		const o = me.isHTMLTemplate(tpl);
		if (!o) return o;
		return me.initTemplate(cached, name, o);
	}

	/**
	 * Retrieve template from given URL
	 * 
	 * @async
	 * @param {boolean} cached Set to true to auto cache if template does not exist
	 * @param {string} name Template name
	 * @param {string} template Template source
	 * @returns {Promise<HTMLTemplateElement>} Template instance
	 */
	static async loadURLTemplate(cached = false, name = '', tpl) {
		const me = GSCacheTemplate;
		try {
			let template = null;
			if (cached) template = me.load(tpl);
			if (template) return template;
			template = await GSLoader.loadTemplate(tpl);
			return me.initTemplate(cached, name, template);
		} catch (e) {
			GSLog.error(me, e);
		}
		return false;
	}

	/**
	 * Retrieve template from given function
	 * 
	 * @async
	 * @param {boolean} cached Set to true to auto cache if template does not exist
	 * @param {string} name Template name
	 * @param {string} template Template source
	 * @returns {Promise<HTMLTemplateElement>} Template instance
	 */
	static async loadFunctionTemplate(cached = false, name = '', tpl) {
		const me = GSCacheTemplate;
		const fn = me.isFunctionTemplate(tpl);
		if (!fn) return fn;
		try {
			let template = null;
			if (me.cached) template = me.load(o);
			if (template) return template;
			template = GSFunction.isFunctionAsync(fn) ? await fn() : fn();
			return me.initTemplate(cached, name, template);
		} catch (e) {
			GSLog.error(me, e);
		}
		return fn;
	}

	/**
	 * Retrieve and cache html template for element
	 * 
	 * @async
	 * @param {boolean} cached Set to true to auto cache if template does not exist
	 * @param {string} name Template name
	 * @param {string} template Template source
	 * @returns {Promise<HTMLTemplateElement>} Template instance
	 */
	static async loadTemplate(cached = false, name = '', tpl) {

		if (!name) return false;
		if (!tpl) return false;

		const me = GSCacheTemplate;

		// try to load override template (by GSElement tag name)
		let template = false;

		if (tpl.indexOf('#') == 0) {
			//template = me.clone(document.getElementById(tpl.slice(1)));
			template = document.getElementById(tpl.slice(1));
			//template = template ? template.innerHTML : null;
		}

		if (!template) {
			template = me.loadHTMLTemplate(cached, name, tpl);
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

