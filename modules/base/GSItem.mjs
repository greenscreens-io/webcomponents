/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSItem class
 * @module base/GSItem
 */

import GSLoader from "./GSLoader.mjs";
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

	static #css = 'data-css';

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
	* Retrieve gs-item template or internal content
	* NOTE: If template set, item content is overriden
	* 
	* @async
	* @param {HTMLElement} el 
	* @returns {Promise<string>}
	*/
	static async getTemplate(el) {
		let tpl = GSItem.getTemplate(el);
		const cnt = tpl ? await GSLoader.getTemplate(tpl) : '';
		if (cnt) return cnt;
		tpl = el.querySelector('template');
		return tpl ? tpl.innerHTML : '';
	}

	/**
	 * Retuen content of HTMLTemplate child element
	 * 
	 * @param {HTMLElement} el 
	 * @returns {string}
	 */
	static getBody(el, flat = false) {
		let tpl = GSItem.getTemplate(el);
		const cls = GSAttr.get(el, 'css-template', '');
		if (tpl) return `<gs-template flat="${flat}" href="${tpl}" class="${cls}"></gs-template>`;
		tpl = el.querySelector('template');
		return tpl ? tpl.innerHTML : '';
	}

	/**
	 * Get first level of generic gs-item element, used for configuring gs-* components
	 * @param {HTMLElement} root 
	 * @returns {Array<HTMLElement>} 
	 */
	static genericItems(root) {
		if (!GSDOM.isHTMLElement(root)) return [];
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

	static getSelectable(el) {
		return GSAttr.getAsBool(el, 'selectable', true);
	}

	static getName(el) {
		return GSAttr.get(el, 'name', '');
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
		return GSItem.getBody(el);
	}

	/**
	 * Convert JSON structure to DOM structure
	 * 
	 * const o = {....}
	 * document.body.innerHTML = GSItem.toDom(o);
	 * GSItem.toJson(document.body.firstElementChild);
	 * 
	 * @param {object} obj JSON Object to convert
	 * @param {string} tag DOM tag name
	 * @param {string} name DOM attribute name for object key
	 * @param {string} value DOM attribute name for object value
	 * @param {string} type DOM attribute name for object type
	 * @returns {string}
	 */
	 static toDom(obj, tag = 'gs-item', name = 'name', value = 'value', type = 'type', child = false) {

		const tmp = [];

		if (!child) tmp.push('<gs-item type="object">');

		if (Array.isArray(obj)) {
			obj.forEach((o, i) => {

				const ptyp = typeof o;
				const isArray = Array.isArray(o);
				const isObj = !isArray && ptyp === 'object';

				if (isObj || isArray) {
					tmp.push(`<${tag} ${type}="object">`);
					tmp.push(GSItem.toDom(o, tag, name, value, type, true ));				
				} else {
					tmp.push(`<${tag} ${value}="${o}" ${type}="${ptyp}">`);
				}

				tmp.push(`</${tag}>`);


			});
		} else {
			Object.entries(obj).forEach(kv => {
	
				const pname = kv[0];
				const pobj = kv[1];
				const ptyp = typeof pobj;
	
				const isArray = Array.isArray(pobj);
				const isObj = !isArray && ptyp === 'object';
				let isSimple = false;
	
				if (isArray && pobj.length > 0) {
					const elIsArray = Array.isArray(pobj[0]);
					const elIsObj = typeof pobj[0] === 'object';
					isSimple = !(elIsArray || elIsObj);
				}
	
				if (isSimple) {
					tmp.push(`<${tag} ${name}="${pname}" ${type}="array">`);
					tmp.push(GSItem.toDom(pobj, tag, name, value, type, true));
				} else if (isArray) {
					tmp.push(`<${tag} ${name}="${pname}" ${type}="array">`);
					tmp.push(GSItem.toDom(pobj, tag, name, value, type, true));
				} else if (isObj) {
					tmp.push(`<${tag} ${name}="${pname}" ${type}="object">`);
					tmp.push(GSItem.toDom(pobj, tag, name, value, type, true));
				} else {
					tmp.push(`<${tag} ${name}="${pname}" ${value}="${pobj}" ${type}="${ptyp}">`);
				}
	
				tmp.push(`</${tag}>`);
	
			});
		}

		if (!child) tmp.push('</gs-item>');

		return tmp.join('');
	}

	/**
	 * Convert DOM tree into a JSON structure
	 * 
	 * const o = {....}
	 * document.body.innerHTML = GSItem.toDom(o);
	 * GSItem.toJson(document.body.firstElementChild);
	 * 
	 * @param {HTMLElement} obj HTML element instance to convert
	 * @param {string} name DOM attribute name for object key
	 * @param {string} value DOM attribute name for object value
	 * @param {string} type DOM attribute name for object type
	 * @returns {object}
	 */
	static toJson(el, name = 'name', value = 'value', type = 'type') {
		
		
		if (!(el instanceof HTMLElement)) return {};
		
		const nameV = el.getAttribute(name);
		const valV = el.getAttribute(value);
		const typeV = el.getAttribute(type);

		let obj = null;

		switch (typeV) {
			case 'array':
				obj = [];
				break;
			case 'object':
				obj = {};
				break;
			default:
				return GSItem.#toType(valV, typeV);
		}
		
		const childs = Array.from(el.children);
		const isArray = typeV === 'array';
		const isObject = typeV === 'object';

		childs.forEach(el => {
			const _nam = el.getAttribute(name);
			if (isArray) {
				obj.push(GSItem.toJson(el, name, value, type));
			} else if(isObject) {
				const tmp = GSItem.toJson(el, name, value, type);
				obj[_nam] = tmp;
			} else {
				const _val = el.getAttribute(value);
				const _typ = el.getAttribute(type);
				obj[nameV][_nam] = GSItem.#toType(_val, _typ);
			}
		});

		return obj;
	}

	static #toType(val, type) {
		switch (type) {
			case 'boolean' : return val === 'true';
			case 'number' : return  parseFloat(val);
			default: return val
		}
	}	
}
