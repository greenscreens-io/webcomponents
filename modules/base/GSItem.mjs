/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSAttr } from "./GSAttr.mjs";
import { GSDOM } from "./GSDOM.mjs";

/**
 * A module loading GSItem class
 * @module base/GSItem
 */

/**
 * Static class for handling generic configurable tag GS-ITEM
 */
export class GSItem extends HTMLElement {

	static #tags = ['GS-ITEM', 'TEMPLATE']

	constructor() {
		super();
		GSItem.validate(this);
	}

	/**
	 * Return template content of GS-ITEM element (if exists)
	 * 
	 * @param {HTMLElement} el 
	 * @returns {String}
	 */
	get body() {
		let tpl = GSAttr.get(this, 'template');
		if (tpl) return `<gs-template src="${tpl}"></gs-template>`;
		tpl = this.querySelector('template');
		return tpl?.innerHTML || '';
	}

	/**
	 * Get first level of generic gs-item elements
	 * @param {HTMLElement} root 
	 * @returns {Array<HTMLElement>} 
	 */
	get items() {
		return Array.from(this.children).filter(el => el.tagName == 'GS-ITEM')
	}

	get name() {
		return GSAttr.get(this, 'name', '');
	}

	asJSON(recursive = true) {
		return GSDOM.toJson(this, recursive);
	}

	/**
	 * Validate that parent element contains only specific childrens
	 * @param {*} own 
	 * @param {*} tagName 
	 * @returns 
	 */
	static validate(own, tagName = 'GS-ITEM') {
		return GSDOM.validate(own, tagName, GSItem.#tags);
	}

	/**
	 * Get first level of generic gs-item element, used for configuring gs-* components
	 * @param {HTMLElement} root 
	 * @returns {Array<HTMLElement>} 
	 */
	static collect(root) {
		if (!GSDOM.isHTMLElement(root)) return [];
		return Array.from(root.children).filter(el => el.tagName == 'GS-ITEM')
	}
		
	/**
	 * Convert GS-ITEM list to JSON
	 * @param {HTMLElement} root Element containing GS-ITEM childs 
	 * @returns {Array} Arary of JSON objects
	 */
	static toJSON(root) {
		return GSItem.collect(root).map(el => el.asJSON(true));
	}

	/**
	 * Make GS-ITEM attributes JSON compatible 
	 * @param {*} root 
	 * @param {*} definition 
	 * @returns 
	 */
    static proxify(root, definition) {        
        return GSItem.collect(root).map(el => GSAttr.proxify(el, definition));
    }

	static {
		customElements.define('gs-item', GSItem);
		Object.seal(GSItem);
	}
}
