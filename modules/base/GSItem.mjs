/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSItem class
 * @module base/GSItem
 */

import GSLoader from "./GSLoader.mjs";
import GSUtil from "./GSUtil.mjs";

/**
 * Static class for handling generic configurable tag GS-ITEM
 */
export default class GSItem extends HTMLElement {

	static #dismiss = 'data-bs-dismiss';

	static #target = 'data-bs-target';

	static #toggle = 'data-bs-toggle';

	static #action = 'data-action';

	static #inject = 'data-inject';

	static #css = 'data-css';

	static #selectable = 'data-selectable';

	static {
		customElements.define('gs-item', GSItem);
	}

	constructor() {
		super();
	}

	/**
	* Retrieve gs-item template or internal content
	* NOTE: If tempalte set, item content is overriden
	* @param {HTMLElement} el 
	* @returns {string}
	*/
	static async getTemplate(el) {
		const tpl = GSUtil.getAttribute(el, 'template');
		const cnt = tpl ? await GSLoader.load(tpl) : '';
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
		if (!Array.isArray(val)) return GSItem.#generateItem(val);
		return GSItem.#generateItems(val);
	}

	static #numOrString(val) {
		return GSUtil.isNumber(val) || GSUtil.isStringNonEmpty(val);
	}

	static #generateItems(o) {
		return o.map(e => GSItem.#generateItem(e)).join('\n');
	}

	static #generateItem(o) {
		const args = GSItem.#generateArgs(o);
		const childs = Array.isArray(o.items) ? GSItem.generateItem(o.items) : '';
		return `<gs-item ${args}>${childs}</gs-item>`;
	}

	static #generateArgs(o) {
		return Object.entries(o).filter(kv => GSItem.#numOrString(kv[1]))
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

	static getInjectAttr(el) {
		const v = GSItem.getInject(el);
		return v ? `${GSItem.#inject}="${v}"` : '';
	}

	static getCSSAttr(el) {
		const v = GSItem.getCSS(el);
		return v ? `${GSItem.#css}="${v}"` : '';
	}

	static getSelectableAttr(el) {
		const v = GSItem.getSelectable(el);
		return v ? '' : `${GSItem.#selectable}="${v}"`;
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

	static getInject(el) {
		return GSUtil.getAttribute(el, 'inject');
	}

	static getSelectable(el) {
		return GSUtil.getAttributeAsBool(el, 'selectable', true);
	}

	static getName(el) {
		return GSUtil.getAttribute(el, 'name', '');
	}

	static getCSS(el) {
		return GSUtil.getAttribute(el, 'css', '');
	}

	get dismissAttr() {
		return GSItem.getDismissAttr(this);
	}

	get targetAttr() {
		return GSItem.getTargetAttr(this);
	}

	get toggleAttr() {
		return GSItem.getToggleAttr(this);
	}

	get actionAttr() {
		return GSItem.getActionAttr(this);
	}

	get injectAttr() {
		return GSItem.getInjectAttr(this);
	}

	get action() {
		return GSItem.getAction(this);
	}

	get dismiss() {
		return GSItem.getDismiss(this);
	}

	get target() {
		return GSItem.getTarget(this);
	}

	get toggle() {
		return GSItem.getToggle(this);
	}

	get inject() {
		return GSItem.getInject(this);
	}

	get selectable() {
		return GSItem.getSelectable(this);
	}

	get name() {
		return GSItem.getName(this);
	}

	get css() {
		return GSItem.getCSS(this);
	}
}