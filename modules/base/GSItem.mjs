/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSItem class
 * @module base/GSItem
 */

import GSUtil from "./GSUtil.mjs";

/**
 * Static class for handling generic configurable tag GS-ITEM
 */
export default class GSItem {

	static #dismiss = 'data-bs-dismiss';

	static #target = 'data-bs-target';

	static #toggle = 'data-bs-toggle';

	static #action = 'data-action';

	/**
	* Retrieve gs-item template or internal content
	* NOTE: If tempalte set, item content is overriden
	* @param {HTMLElement} el 
	* @returns {string}
	*/
	static async getTemplate(el) {
		const tpl = GSUtil.getAttribute(el, 'template');
		const cnt = tpl ? await GSUtil.load(tpl) : '';
		if (cnt) return cnt;
		return Array.from(el.childNodes)
			.filter(el => el.tagName != 'GS-ITEM')
			.map(it => it instanceof Text ? it.nodeValue : it.outerHTML)
			.join('');
	}

	/**
	 * Get first level of generic gs-item elemtn, used for configuring gs-* components
	 * @param {HTMLElement} root 
	 * @returns {Array<HTMLElement>} 
	 */
	static genericItems(root) {
		if (!GSUtil.isHTMLElement(root)) return [];
		return Array.from(root.childNodes).filter(el => el.tagName == 'GS-ITEM')
	}

	/**
	 * Generate generic <gs-item>  tag from json object. Used by several GS Components
	 * Json format: array of json or json (child elemetns stored in item property
	 * Any property will be rendered as gs-item element attribute
	 * Example: [{title:"test2", message:"test2", items: [{title:"test2", message:"test2"}]}] 
	 * @param {*} val 
	 * @returns {string} generated html <gs-item...>
	 */
	static generateItem(val = '') {
		if (!GSUtil.isJsonType(val)) return '';
		if (!Array.isArray(val)) return GSUtil.#generateItem(val);
		return GSUtil.#generateItems(val);
	}

	static #numOrString(val) {
		return GSUtil.isNumber(val) || GSUtil.isStringNonEmpty(val);
	}

	static #generateItems(o) {
		return o.map(e => GSUtil.#generateItem(e)).join('\n');
	}

	static #generateItem(o) {
		const args = GSUtil.#generateArgs(o);
		const childs = Array.isArray(o.items) ? GSUtil.genrateItem(o.items) : '';
		return `<gs-item ${args}>${childs}</gs-item>`;
	}

	static #generateArgs(o) {
		return Object.entries(o).filter(kv => GSUtil.#numOrString(kv[1]))
			.map(kv => `${kv[0]}="${kv[1]}"`).join(' ');
	}

	static getDismissAttr(el) {
		const v = GSItem.getDismiss(el);
		return v ? `${GSItem.#dismiss}="${v}"` : '';
	}

	static getTargetAttr(el) {
		const v = GSItem.getTarget(el);
		return v ? `${GSItem.#target}="${v}"` : '';
	}

	static getToggleAttr(el) {
		const v = GSItem.getToggle(el);
		return v ? `${GSItem.#toggle}="${v}"` : '';
	}

	static getActionAttr(el) {
		const v = GSItem.getAction(el);
		return v ? `${GSItem.#action}="${v}"` : '';
	}

	static getAction(el) {
		return GSUtil.getAttribute(el, 'action');
	}

	static getDismiss(el) {
		return GSUtil.getAttribute(el, 'dismiss');
	}

	static getTarget(el) {
		return GSUtil.getAttribute(el, 'target');
	}

	static getToggle(el) {
		return GSUtil.getAttribute(el, 'toggle');
	}

}