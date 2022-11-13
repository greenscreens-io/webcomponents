/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSItem class
 * @module base/GSItem
 */

import GSUtil from "./GSUtil.mjs";
import GSAttr from "./GSAttr.mjs";
import GSDOM from "./GSDOM.mjs";

/**
 * Static class for handling generic configurable tag GS-ITEM
 */
export default class GSItem extends HTMLElement {

	static #dismiss = 'data-bs-dismiss';

	static #target = 'data-bs-target';

	static #toggle = 'data-bs-toggle';

	static #action = 'data-action';

	static #inject = 'data-inject';

	static #selectable = 'data-selectable';

	static #tags = ['GS-ITEM', 'TEMPLATE']

	static {
		customElements.define('gs-item', GSItem);
		Object.seal(GSItem);
	}

	constructor() {
		super();
		GSItem.validate(this);
	}

	static validate(own, tagName = 'GS-ITEM') {
		return GSDOM.validate(own, tagName, GSItem.#tags);
	}

	/**
	 * Return content of HTMLTemplate child element
	 * 
	 * @param {HTMLElement} el 
	 * @returns {string}
	 */
	static getBody(el, flat = false) {
		let tpl = GSItem.getTemplate(el);
		const isFlat = GSItem.getFlat(el);
		const anchor = GSItem.getAnchor(el);
		const acss = isFlat || flat ? `anchor="${anchor}" flat="true"` : '';
		const cls = GSAttr.get(el, 'css-template', '');
		if (tpl) return `<gs-template ${acss} href="${tpl}" class="${cls}"></gs-template>`;
		tpl = el.querySelector('template');
		return tpl?.innerHTML || '';
	}

	/**
	 * Get first level of generic gs-item element, used for configuring gs-* components
	 * @param {HTMLElement} root 
	 * @returns {Array<HTMLElement>} 
	 */
	static genericItems(root) {
		if (!GSDOM.isHTMLElement(root)) return [];
		return Array.from(root.children).filter(el => el.tagName == 'GS-ITEM')
	}

	/**
	 * Hepler to joinf all base data-bs related attributes
	 * @param {*} el 
	 * @returns 
	 */
	static getAttrs(el) {
		return [GSItem.getDismissAttr(el), GSItem.getTargetAttr(el),
		GSItem.getToggleAttr(el), GSItem.getActionAttr(el),
		GSItem.getInjectAttr(el)].join(' ');
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

	static getSelectableAttr(el) {
		const v = GSItem.getSelectable(el);
		return v ? '' : `${GSItem.#selectable}="${v}"`;
	}

	static getActive(el) {
		return GSAttr.getAsBool(el, 'active');
	}

	static getAction(el) {
		return GSAttr.get(el, 'action');
	}

	static getDismiss(el) {
		return GSAttr.get(el, 'dismiss');
	}

	static getTarget(el) {
		return GSAttr.get(el, 'target');
	}

	static getToggle(el) {
		return GSAttr.get(el, 'toggle');
	}

	static getInject(el) {
		return GSAttr.get(el, 'inject');
	}

	static getIcon(el) {
		return GSAttr.get(el, 'icon');
	}

	static getSelectable(el) {
		return GSAttr.getAsBool(el, 'selectable', true);
	}

	static getAnchor(el) {
		return GSAttr.get(el, 'anchor', 'afterend@self');
	}

	static getFlat(el) {
		return GSAttr.getAsBool(el, 'flat', false);
	}

	static getName(el) {
		return GSAttr.get(el, 'name', '');
	}

	static getHref(el) {
		return GSAttr.get(el, 'href', '#');
	}

	static getCSS(el) {
		return GSAttr.get(el, 'css', '');
	}

	static getTemplate(el) {
		return GSAttr.get(el, 'template', '');
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

	get flat() {
		return GSItem.getFlat(this);
	}

	get name() {
		return GSItem.getName(this);
	}

	get css() {
		return GSItem.getCSS(this);
	}

	get active() {
		return GSItem.getActive(this);
	}

	get template() {
		return GSItem.getTemplate(this);
	}

	get body() {
		return GSItem.getBody(this);
	}

	get href() {
		return GSItem.getHref(this);
	}
}
