/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDOM class
 * @module base/GSDOM
 */

import GSElement from "./GSElement.mjs";
import GSLog from "./GSLog.mjs";

/**
 * A generic set of static functions to handle DOM tree and DOM elements
 * @class
 */
export default class GSDOM {

	// Timeout for removing element
	static SPEED = 300;

	/**
	* Parse string into html DOM
	*
	* @param {string} html Source to parse
	* @param {boolean} single Return first element or all
	* @param {string} mime Src mime type
	* @return {HTMLElement}
	*/
	static parse(html = '', single = false, mime = 'text/html') {
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, mime);
			return single ? doc.body.firstElementChild : doc;
		} catch (e) {
			GSLog.error(null, e);
			throw e;
		}
	}

	/**
	 * Parse source and auto wrap if required
	 * @param {GSElement} own 
	 * @param {string} src 
	 * @returns {HTMLElement}
	 */
	static parseWrapped(own, src = '', forceWrap = false) {

		const doc = GSDOM.parse(src);
		const nodes = GSDOM.#fromNode(doc.head.children).concat(GSDOM.#fromNode(doc.body.children));
		const wrap = forceWrap || nodes.length !== 1;

		const tpl = GSDOM.wrap(own, wrap ?  null : nodes.shift());

		while (nodes.length > 0) tpl.appendChild(nodes.shift());

		return tpl;
	}

	static wrap(own, tpl) {
		tpl = tpl || document.createElement('gs-block');
		GSDOM.link(own, tpl);
		return tpl;
	}

	static link(own, tpl) {
		tpl.setAttribute('proxy', own.id);
		if (own.slot) tpl.setAttribute('slot', own.slot);
	}

	static #fromNode(nodes) {
		return nodes ? Array.from(nodes).filter(el => (!(el instanceof Text))) : [];
	}

	/**
	  * Check if given element is of given type 
	  * 
	  * @param {HTMLElement} el
	  * @param {string|class} type
	  * @returns {boolean}
	  */
	static isElement(el, type) {
		if (type && el) {
			if (typeof type === 'string') {
				if (type.toUpperCase() === el.tagName) return el;
			} else if (el instanceof type) return el;
		}
		return false;
	}

	/**
	 * Check if given element is of type HTMLElement
	 * @returns {boolean}
	 */
	static isTemplateElement(el) {
		//return el instanceof HTMLTemplateElement && el.content && el.content.firstElementChild;
		return el instanceof HTMLTemplateElement;
	}

	/**
	 * Check if given element is of type HTMLElement
	 * @returns {boolean}
	 */
	static isHTMLElement(el) {
		return el instanceof HTMLElement;
	}

	/**
	 * Check if given element is of type SVGElement
	 * @returns {boolean}
	 */
	static isSVGElement(el) {
		return el instanceof SVGElement;
	}

	/*
	 * Check if given element is of type GSElement
	 */
	static isGSElement(el) {
		if (!GSDOM.isHTMLElement(el)) return false;
		return el.tagName.indexOf('GS-') === 0;
	}

	/**
	 * Check if standard element extended with GS
	 * @param {HTMLElement} el 
	 * @returns {boolean}
	 */
	static isGSExtra(el) {
		if (!GSDOM.isHTMLElement(el)) return false;
		return (el.getAttribute('is') ||'').indexOf('gs-') === 0;
	}

	/**
	 * Get all child GSElement	
	 * @param {HTMLElement} el 
	 * @returns {Array<HTMLElement>}
	 */
	static getChilds(el) {
		if (!GSDOM.isHTMLElement(el)) return [];
		return Array.from(el.childNodes).filter(e => GSDOM.isGSElement(e));
	}

	/**
	 * Hide html element
	 * @param {HTMLElement} el 
	 * @param {boolean} orientation 
	 * @returns {void}
	 */
	static hide(el, orientation = false) {
		if (!GSDOM.isHTMLElement(el)) return;
		const css = orientation ? 'gs-hide-orientation' : 'gs-hide';
		el.classList.add(css);
	}

	/**
	 * Show html element
	 * @param {HTMLElement} el 
	 * @param {boolean} orientation 
	 * @returns {booelan}
	 */
	static show(el, orientation = false) {
		if (!GSDOM.isHTMLElement(el)) return;
		const css = orientation ? 'gs-hide-orientation' : 'gs-hide';
		return el.classList.remove(css);
	}

	/**
	 * Add node as next in list of nodes
	 * @param {HTMLElement} target 
	 * @param {HTMLElement} newEl 
	 * @returns {boolean}
	 */
	static addSibling(target, newEl) {
		const injectable = GSDOM.isHTMLElement(newEl) || GSDOM.isSVGElement(newEl);
		const isOK = GSDOM.isHTMLElement(target) && injectable;
		const invalid = target === newEl && target.parentNode === newEl || target.nextElementSibling === newEl;
		return isOK && !invalid ? target.parentNode.insertBefore(newEl, target.nextElementSibling) : false;
	}

	/**
	 * Add child node to a target
	 * @param {HTMLElement} target 
	 * @param {HTMLElement} newEl 
	 * @returns {boolean}
	 */
	static appendChild(target, newEl) {
		const isok = GSDOM.isHTMLElement(target) && GSDOM.isHTMLElement(newEl);
		return isok && target !== newEl ? target.appendChild(newEl) : false;
	}

	/**
	 * Add node to a target at specified place
	 * @param {HTMLElement} target 
	 * @param {HTMLElement} newEl 
	 * @returns {boolean}
	 */
	static insertAdjacent(target, newEl, placement) {
		const isok = GSDOM.isHTMLElement(target) && GSDOM.isHTMLElement(newEl);
		const invalid = target === newEl && target.parentNode === newEl
		return isok && !invalid ? target.insertAdjacentElement(placement, newEl) : false;
	}

	/**
	 * Remove genreted componnt from parent
	 * @param {HTMLElement} el 
	 * @returns {boolean}
	 */
	static removeElement(el) {
		const isOk = GSDOM.isHTMLElement(el) && el.parentNode;
		return isOk ? el.parentNode.removeChild(el) : false;
	}

	/**
	 * Find element by css selector from given context or return default element
	 * 
	 * @param {HTMLElement} ctx 
	 * @param {string} val CSS query selector
	 * @param {HTMLElement} def Default element
	 * @returns {HTMLElement}
	 */
	static findElement(ctx, val = '', def = null) {
		if (!val) return def;
		if (!GSDOM.isHTMLElement(ctx)) return def;
		try {
			return ctx.querySelector(val) || def;
		} catch (e) {
			GSLog.error(ctx, e);
		}
		return def;
	}

	/**
	 * Walk node tree
	 * @param {HTMLLegendElement} rootEL 
	 * @param {function} callback 
	 * @returns {boolean}
	 */
	static walk(rootEL, callback) {
		if (typeof callback !== 'function') return false;
		callback(rootEL);
		rootEL.childNodes.forEach(el => GSDOM.walk(el, callback));
		return true;
	}

	/**
	 * Get parent element
	 * @param {HTMLElement} el 
	 * @returns {HTMLElement}
	 */
	static parent(el) {
		return el ? (el.parentElement || el.parentNode || el.host) : null;
	}

	/**
	 * Parent element iterator
	 * @param {HTMLElement} el 
	 * @returns {HTMLElement}
	 * @iterator
	 */
	static *parentAll(el) {
		let e = GSDOM.parent(el);
		while (e) {
			yield e;
			e = GSDOM.parent(e);
		}
		return yield e;
	}

	/**
	 * Get root element whch might be shadow root, GSElelement, any parent element
	 * @param {HTMLElement} el 
	 * @returns {HTMLElement|ShadowRoot}
	 */
	static getRoot(el) {
		if (!el) return null;

		const it = GSDOM.parentAll(el);
		for (let v of it) {
			if (v instanceof ShadowRoot) return v;
			if (v instanceof HTMLBodyElement) return v;
		}

		return null;
	}

	/**
	 * Set html text to provided element
	 * @param {HTMLElement} el 
	 * @param {string} val 
	 * @returns {void}
	 */
	static setHTML(el, val = '') {
		if (!GSDOM.isHTMLElement(el)) return false;
		el.innerHTML = val;
	}

	/**
	 * Set text to provided element
	 * @param {HTMLElement} el 
	 * @param {string} val 
	 * @returns {void}
	 */
	static setText(el, val = '') {
		if (!GSDOM.isHTMLElement(el)) return false;
		el.innerText = val;
	}

	/**
	 * Safe way to toggle CSS class on element, multipel classes are supported in space separated string list
	 * @param {HTMLElement} el 
	 * @param {boolean} sts Ture to add, false to remove
	 * @param {*} val list of css classes in spaec separated string
	 * @returns {boolean}
	 */
	static toggleClass(el, sts = true, val = 'd-none') {
		if (!GSDOM.isHTMLElement(el)) return false;
		if (!val || val.trim().length == 0) return false;
		val = val.split(' ').filter(v => v && v.trim().length > 0);
		if (sts === null) return val.forEach(v => el.classList.toggle(v));
		sts ? el.classList.add.apply(el.classList, val) : el.classList.remove.apply(el.classList, val);
	}

	/**
	 * Checks if element contains a css class
	 * @param {HTMLElement} el 
	 * @param {string} val 
	 * @returns {boolean}
	 */
	static hasClass(el, val = '') {
		if (!GSDOM.isHTMLElement(el)) return false;
		return el.classList.contains(val);
	}

	/**
	 * Search for named slot tag or css selector 
	 * @param {HTMLElement} own 
	 * @param {string} name Tagged slot  name
	 * @param {*} qry CSS selector
	 * @param {*} multi true to return array or false for a single element
	 * @returns {HTMLElement|Array<HTMLElement>}
	 */
	static findSlotOrEl(own, name = '', qry = '', multi = false) {
		const fn = multi ? 'querySelectorAll' : 'querySelector';
		if (!(own && own[fn])) return multi ? [] : null;
		const el = name ? own[fn](`[slot="${name}"]`) : null;
		if (el) return el;
		if (!el && own.shadowRoot) return own.shadowRoot[fn](qry);
		return own[fn](qry);
	}


	/**
	 * Alternative way to clear fields instead of form.reset()
	 * @param {HTMLElement} owner 
	 * @param {string} qry 
	 */
	static clearInputs(owner, qry = 'input, textarea') {
		const root = GSDOM.unwrap(owner);
		requestAnimationFrame(() => {
			root.querySelectorAll(qry).forEach((el) => el.value = '');
		});
	}

	/**
	 * Get value from form element
	 * @param {HTMLElement} el 
	 * @returns {string}
	 */
	static toValue(el) {
		if (!GSDOM.isHTMLElement(el)) return undefined;
		let value = el.value;
		if ('text' === el.type) {
			const map = el.computedStyleMap().get('text-transform');
			if (map) {
				if ('lowercase' == map.value) value = el.value.toLowerCase();
				if ('uppercase' == map.value) value = el.value.toUpperCase();
			}
		}
		return value;
	}

	/**
	 * Convert form elements into JSON object
	 * @param {HTMLElement} owner 
	 * @param {string} qry 
	 * @param {boolean} hidden 
	 * @returns {object}
	 */
	static toObject(owner, qry = 'input, textarea, select', hidden = false) {
		const root = GSDOM.unwrap(owner);
		const params = {};
		root.querySelectorAll(qry).forEach(el => {
			if (!el.name) return;
			if (!hidden && el.getAttribute('data-ignore') === 'true') return;
			params[el.name] = GSDOM.toValue(el);
		});
		return params;
	}

	/**
	 * Convert JSON Object into HTMLElements (input)
	 * @param {*} owner 
	 * @param {*} qry 
	 * @param {*} obj 
	 * @returns 
	 */
	static fromObject(owner, obj, qry = 'input, textarea, select') {
		if (!obj) return;
		const root = GSDOM.unwrap(owner);
		root.querySelectorAll(qry).forEach(el => {
			if (!el.name) return;
			if (obj.hasOwnProperty(el.name)) el.value = obj[el.name];
		});
	}

	/**
	 * Convert URL hash key/value to form elements
	 * @param {HTMLElement} owner 
	 */
	static fromURLHashToForm(owner) {
		location.hash.slice(1).split('&').every((v) => {
			if (v.length < 2) return true;
			const d = v.split('=');
			GSDOM.setValue(`input[name=${d[0]}]`, d[1], owner);
			return true;
		});
	}

	/**
	 * Return element shadowRoot or self
	 * @param {HTMLElement} owner 
	 * @returns {HTMLElement|shadowRoot}
	 */
	static unwrap(owner) {
		if (!owner) return document;
		return GSDOM.isGSElement(owner) ? owner.shadowRoot : owner;
	}

	/**
	 * Get element by id, searcing down owner element as root
	 * @param {string} name 
	 * @param {HTMLElement} own 
	 * @returns {HTMLElement}
	 */
	static getEl(name, own) {
		if (!name) return null;
		return GSDOM.findEl(`#${name}`, own);
	}

	/**
	 * Find element by css selector, searching down owner element as root
	 * @param {string} name 
	 * @param {HTMLElement} own 
	 * @returns {HTMLElement}
	 */
	static findEl(name, own) {
		if (!name) return null;
		return (own || document).querySelector(name);
	}

	/**
	 * Find all elements by css selector, searching down owner element as root
	 * @param {string} name 
	 * @param {HTMLElement} own 
	 * @param {boolean} asArray 
	 * @returns {Array<HTMLElement>|NodeList} 
	 */
	static findAll(name, own, asArray = false) {
		if (!name) return null;
		const list = (own || document).querySelectorAll(name);
		return asArray ? Array.from(list) : list;
	}

	/**
	 * Enable input on all input elements under provided owner
	 * @param {string} qry Default to form
	 * @param {HTMLElement} own 
	 */
	static enableInput(qry = 'form', own) {
		const root = GSDOM.findEl(qry, own);
		if (root) GSDOM.findAll('input, select, .btn', own).forEach(el => el.removeAttribute('disabled'));
	}

	/**
	 * Disable input on all input elements under provided owner
	 * @param {string} qry Default to form
	 * @param {HTMLElement} own 
	 */
	static disableInput(qry = 'form', own) {
		const root = GSDOM.findEl(qry, own);
		if (root) GSDOM.findAll('input, select, .btn', el).forEach(el => el.setAttribute('disabled', true));
	}

	/**
	 * Set value to a element by css selector
	 * @param {string} qry 
	 * @param {string} val 
	 * @param {HTMLElement} own 
	 */
	static setValue(qry, val, own) {
		const el = GSDOM.findEl(qry, own);
		if (el) el.value = val;
	}

	/**
	 * Find text nodes
	 * @param {HTMLElement} el 
	 * @returns {Array<string>}
	 */
	static textNodesUnder(el) {
		const walk = document.createTreeWalker(el || document, NodeFilter.SHOW_TEXT, null, false);
		const a = [];
		let n;
		while (n = walk.nextNode()) a.push(n);
		return a;
	}

	/**
	 * Remove invalid text characters from html element nodes
	 * @param {HTMLElement} root 
	 */
	static cleanHTML(root) {
		const ts = GSDOM.textNodesUnder(root || document).filter(t => t.wholeText.trim().length === 0);
		ts.filter(el => el.nextSibling instanceof Text).forEach(el => el.remove());
		ts.forEach(t => t.nodeValue = t.wholeText.replaceAll(/\u0020{4}/g, '\t').replaceAll(/(\n*\t*)*(?=\n\t*)/g, ''));
	}

	static {
		Object.seal(GSDOM);
		window.GSDOM = GSDOM;
	}
}

