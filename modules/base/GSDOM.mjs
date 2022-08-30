/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDOM class
 * @module base/GSDOM
 */

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
			return single ? doc?.body?.firstElementChild : doc;
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

		const tpl = GSDOM.wrap(own, wrap ? null : nodes.shift());

		while (nodes.length > 0) tpl.appendChild(nodes.shift());

		return tpl;
	}

	/**
	 * The same as lin function, with default wrapper element
	 * 
	 * @param {HTMLElement} own Owner element to which target is linked
	 * @param {HTMLElement} target Target elemetn to link to owner
	 * @returns {HTMLElement} Return target
	 */
	static wrap(own, target) {
		return GSDOM.link(own, target || document.createElement('gs-block'));
	}

	/**
	 * Create reference between two HTMLElements
	 * 
	 * @param {HTMLElement} own Owner element to which target is linked
	 * @param {HTMLElement} target Target elemetn to link to owner
	 * @returns {HTMLElement} Return target
	 */
	static link(own, target) {
		target.setAttribute('proxy', `#${own.id}`);
		if (own.slot) target.setAttribute('slot', own.slot);
		return target;
	}

	static #fromNode(nodes) {
		return Array.from(nodes || []).filter(el => !GSDOM.isText(el));
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

	/**
	 * Check if given element is of type Text
	 * @returns {boolean}
	 */
	static isText(el) {
		return el instanceof Text;
	}

	/**
	 * Check if given element is of type Comment
	 * @returns {boolean}
	 */
	static isComment(el) {
		return el instanceof Comment;
	}

	/*
	 * Check if given element is of type GSElement
	 */
	static isGSElement(el) {
		return el?.tagName?.indexOf('GS-') === 0;
	}

	/**
	 * Check if standard element extended with GS
	 * @param {HTMLElement} el 
	 * @returns {boolean}
	 */
	static isGSExtra(el) {
		return el?.getAttribute('is')?.indexOf('GS-') === 0;
	}

	/**
	 * Get all child GSElement	
	 * @param {HTMLElement} el 
	 * @returns {Array<HTMLElement>}
	 */
	static getChilds(el) {
		return Array.from(el?.childNodes || []).filter(e => GSDOM.isGSElement(e));
	}

	/**
	 * Hide html element
	 * @param {HTMLElement} el 
	 * @param {boolean} orientation 
	 * @returns {boolean}
	 */
	static hide(el, orientation = false) {
		return el?.classList?.add(orientation ? 'gs-hide-orientation' : 'gs-hide');
	}

	/**
	 * Show html element
	 * @param {HTMLElement} el 
	 * @param {boolean} orientation 
	 * @returns {boolean}
	 */
	static show(el, orientation = false) {
		return el?.classList?.remove(orientation ? 'gs-hide-orientation' : 'gs-hide');
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
	 * @param {string} placement
	 * @returns {boolean}
	 */
	static insertAdjacent(target, newEl, placement) {
		const isok = GSDOM.isHTMLElement(target) && GSDOM.isHTMLElement(newEl);
		const invalid = target === newEl && target.parentNode === newEl
		return isok && !invalid ? target.insertAdjacentElement(placement, newEl) : false;
	}

	/**
	 * Remove genarated componnt from parent
	 * @param {HTMLElement} el 
	 * @returns {boolean}
	 */
	static removeElement(el) {
		return el?.parentNode?.removeChild(el);
	}

	/**
	 * Walk node tree
	 * 
	 * @param {HTMLLegendElement} node Start node to walk from 
	 * @param {boolean} closest Direction down (false) or up (true)
	 * @param {boolean} all  Filter HTMLElements (false) only or text also (true) (only down)
	 * @param {boolean} shadow Traverse shadow DOM also (only down)
	 * @returns {Iterable}
	 */
	static walk(node, closest = false, all = false, shadow = true) {
		return closest ? GSDOM.parentAll(node) : GSDOM.childAll(node, all, shadow);
	}

	/**
	 * Traverse DOM tree top-to-bottom
	 * 
	 * @param {*} node Start node
	 * @param {*} all  Include all elements (Text,Comment, HTMLElements)
	 * @param {*} shadow Include traversing aacross shadow tree
	 * @param {*} child Inernal, do not use
	 * @returns {Iterable}
	 */
	static *childAll(node, all = false, shadow = true, child = false) {
		if (!node) return;
		if (child) yield node;
		if (shadow) yield* GSDOM.childAll(node.shadowRoot, all, shadow, true);
		const list = all ? node.childNodes : node.children;
		if (!list) return;
		for (let child of list) {
			yield* GSDOM.childAll(child, all, shadow, true);
		}
	}

	/**
	 * Get parent element
	 * 
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
		if (e) return yield e;
	}

	/**
	 * Get root element whch might be shadow root, GSElement, any parent element
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
	 * Find element by ID within DOM Tree across Shadow DOM
	 * @param {HTMLElement} el Root node to start from
	 * @param {string} id Element id
	 * @returns {HTMLElement} 
	 */
	static getByID(el, id) {
		if (!(el && qry)) return null;
		const it = GSDOM.walk(el, true);
		for (let o of it) {
			if (o.id === id) return o;
		}
		return null;
	}

	/**
	 * Query DOM Tree up to find closest element across Shadow DOM
	 * @param {HTMLElement} el Root node to start from
	 * @param {string} qry CSS query
	 * @returns {HTMLElement} 
	 */
	static closest(el, qry) {
		if (!(el && qry)) return null;
		const it = GSDOM.walk(el, true);
		for (let o of it) {
			if (GSDOM.matches(o, qry)) return o;
		}
		return null;
	}

	/**
	 * Query DOM tree with support for Shadow DOM
	 * 
	 * @param {HTMLElement} el Root node to start from
	 * @param {string} qry CSS query
	 * @returns {HTMLElement} 
	 */
	static query(el, qry) {
		if (!(el && qry)) return null;
		if (GSDOM.matches(el, qry)) return el;
		const it = GSDOM.walk(el, false, false);
		for (let o of it) {
			if (GSDOM.matches(o, qry)) return o;
		}
		return null;
	}

	/**
	 * Match element against CSS query
	 * @param {HTMLElement} el 
	 * @param {string} qry 
	 * @returns {boolean}
	 */
	static matches(el, qry) {
		// return el && qry && typeof el.matches === 'function' && el.matches(qry);
		return el && typeof el.matches === 'function' && el.matches(qry);
	}

	/**
	 * Query DOM tree with support for Shadow DOM
	 * 
	 * @param {HTMLElement} el Root node to start from
	 * @param {string} qry CSS query
	 * @returns {Array<HTMLElement>}
	 */
	static queryAll(el, qry) {
		const res = [];
		if (!(el && qry)) return res;
		const it = GSDOM.walk(el, false, false);
		for (let o of it) {
			if (GSDOM.matches(o, qry)) res.push(o);
		}
		return res;
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
		if (GSDOM.isHTMLElement(el)) el.innerText = val;
	}

	/**
	 * Safe way to toggle CSS class on element, multipel classes are supported in space separated string list
	 * @param {HTMLElement} el 
	 * @param {boolean} sts True to add, false to remove
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
		return el?.classList?.contains(val);
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
		const list = root.querySelectorAll(qry);
		Array.from(list)
			.filter(el => el.name)
			.forEach(el => {
				if (!hidden && el.dataset.ignore === 'true') return;
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
		const list = root.querySelectorAll(qry);
		Array.from(list)
			.filter(el => el.name && obj.hasOwnProperty(el.name))
			.forEach(el => el.value = obj[el.name]);
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
		return owner ? owner.self || owner : document;
	}

	/**
	 * Enable input on all input elements under provided owner
	 * @param {HTMLElement} own 
	 * @param {string} qry Default to form
	 */
	static enableInput(own, qry = 'input, select, .btn') {
		GSDOM.queryAll(own, qry).forEach(el => el.removeAttribute('disabled'));
	}

	/**
	 * Disable input on all input elements under provided owner
	 * @param {HTMLElement} own 
	 * @param {string} qry Default to form
	 */
	static disableInput(own, qry = 'input, select, .btn') {
		GSDOM.queryAll(el, qry).forEach(el => el.setAttribute('disabled', true));
	}

	/**
	 * Set value to a element by css selector
	 * @param {string} qry 
	 * @param {string} val 
	 * @param {HTMLElement} own 
	 */
	static setValue(qry, val, own) {
		const el = GSDOM.query(own, qry);
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

	/**
	 * Validate against provided list, if child elements allowed inside provided element
	 * @param {HTMLElement} el Element which slild list to validate
	 * @param {string} tagName Expected owner element tag name
	 * @param {string} whiteList Uppercase list of tag names allowed as child
	 * @param {boolean} asState return state as bool or throw an error (default)
	 * @returns {boolean} return true if validation is ok.
	 * @throws {Error}
	 */
	static validate(own, tagName, whiteList, asState = false) {
		if (own.tagName !== tagName) {
			if (asState) return false;
			throw new Error(`Owner element : ${own.tagName}, id:${own.id} is not of excpected type: ${tagName}`);
		}
		//const ok = Array.from(own.childNodes).filter(el => GSDOM.isAllowed(el, whiteList)).length === 0;
		const ok = GSDOM.isAllowed(Array.from(own.childNodes), whiteList);
		if (ok) return true;
		if (asState) return false;
		const msg = GSDOM.toValidationError(own, whiteList);
		throw new Error(msg);
	}

	/**
	 * Check against provided list, if child elements allowed inside provided element
	 * @param {HTMLElement|Array<HTMLElement>} el Element which childs to validate against provided list
	 * @param {string} whiteList Uppercase list of tag names allowed as child nodes
	 * @returns {boolean} return tr ue if validation is ok.
	 */
	static isAllowed(el, whiteList) {
		if (Array.isArray(el)) return el.filter(el => GSDOM.isAllowed(el, whiteList)).length === 0;
		return !(el instanceof Text || el instanceof Comment) && (whiteList.indexOf(el.tagName) === -1);
	}

	static toValidationError(own, whiteList) {
		const list = `<${whiteList.join('>, <')}>`;
		return `${own.tagName} ID: ${own.id} allows as a child nodes only : ${list}!`;
	}

	/**
	 * Inject css directly into a shadowRoot of an element
	 * 
	 * @async
	 * @param {HTMLElement} own 
	 * @param {string} url 
	 * @returns {Promise<boolean>}
	 */
	static async injectCSS(own, url) {
		if (!own?.shadowRoot instanceof ShadowRoot) return false;
		let sts = true;
		try {
			const res = await fetch(url);
			if (!res.ok) return;
			const css = await res.text();
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(css);
			own.shadowRoot.adoptedStyleSheets = [sheet];
		} catch (e) {
			console.log(e);
			sts = false;
		}
		return sts;
	}

	static {
		Object.seal(GSDOM);
		window.GSDOM = GSDOM;
	}
}


