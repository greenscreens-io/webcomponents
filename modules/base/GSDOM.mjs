/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDOM class
 * @module base/GSDOM
 */

import GSCSSMap from "./GSCSSMap.mjs";
import GSLog from "./GSLog.mjs";
import GSUtil from "./GSUtil.mjs";

/**
 * A generic set of static functions to handle DOM tree and DOM elements
 * @class
 */
export default class GSDOM {

	static QUERY_FOCUSABLE = "a[href]:not([tabindex='-1']),area[href]:not([tabindex='-1']),input:not([disabled]):not([tabindex='-1']),select:not([disabled]):not([tabindex='-1']),textarea:not([disabled]):not([tabindex='-1']),button:not([disabled]):not([tabindex='-1']),iframe:not([tabindex='-1']),[tabindex]:not([tabindex='-1']),[contentEditable=true]:not([tabindex='-1'])";
	static QUERY_INPUT = "input:not([type='hidden']):not(disabled):not(readonly),select:not([type='hidden']):not(disabled):not(readonly),textarea:not([type='hidden']):not(disabled):not(readonly)";

	// Timeout for removing element
	static SPEED = 300;

	/**
	 * Find active (focused) element	
	 * @returns {HTMLElement} Focused element
	 */
	static get activeElement() {
		return GSDOM.active(document.activeElement);
	}

	/**
	 * Find active (focused) element
	 * @param {HTMLElement} el Starting node
	 * @returns {HTMLElement} Focused element
	 */
	static active(el) {
		return el.shadowRoot?.activeElement ? GSDOM.active(el.shadowRoot?.activeElement) : el;
	}

	/**
	 * Check if element is visible
	 * @param {HTMLElement} el 
	 * @returns 
	 */
	static isVisible(el) {
		if (!GSDOM.isHTMLElement(el)) return false;
		const css = GSCSSMap.getComputedStyledMap(el);
		const visibility = !css.matches('visibility', 'hidden');
		const display = !css.matches('display', 'none');
		const opacity = css.asNum('opacity') > 0;
		const rect = el.getBoundingClientRect();
		const size = (rect.width > 0 && rect.height > 0);
		return size && opacity && visibility && display;
	}

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
			return single ? (doc?.head?.firstElementChild || doc?.body?.firstElementChild) : doc;
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
	 * The same as link function, with default wrapper element
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
	 * Check if given value is part of HTMLFormElement
	 * @param {string | HTMLElement} el 
	 * @returns {boolean}
	 */
	static isFormElement(el) {
		const name = GSUtil.isString(el) ? el : el?.tagName;
		return ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].indexOf(name) > -1;
	}

	/**
	  * Check if given element is of given type 
	  * 
	  * @param {HTMLElement} el
	  * @param {string|class} type Tag Name, class name or Class
	  * @returns {boolean}
	  */
	static isElement(el, type) {

		const isArgs = type && el;
		if (!isArgs) return false;

		const isStr = GSUtil.isString(type);

		if (!isStr) return el instanceof type;

		const ownClazz = customElements.get(type.toLowerCase());
		if (ownClazz && el instanceof ownClazz) return el;

		const it = GSDOM.inheritance(el);
		for (let pel of it) {
			if (pel?.constructor?.name === type) return el;
		}

		if (type.toUpperCase() === el.tagName) return el;

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
		if (!el?.clazzName) return false;
		//if (el?.tagName?.indexOf('GS-') === 0) return true;
		const it = GSDOM.inheritance(el);
		for (let v of it) {
			if (!v) break;
			if (v?.clazzName === 'GSElement') return true;
		}
		return false;
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
		return GSDOM.parent(el)?.removeChild(el);
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
	 * Element prototype iterator
	 * @param {HTMLElement} el 
	 * @returns {HTMLElement}
	 * @iterator
	 */
	static *inheritance(el) {
		let e = el.__proto__;
		while (e) {
			yield e;
			e = e.__proto__;
		}
		if (e) return yield e;
	}

	/**
	 * Recursively find offsetparent; used in positional offset calculation
	 * @param {HTMLElement} el 
	 * @returns {HTMLElement}
	 */
	static offsetParent(el) {
		let offset = el?.offsetParent;
		if (offset) return offset;
		const it = GSDOM.parentAll(el);
		for (const c of it) {
			offset = c.offsetParent;
			if (offset) break;
		}
		return offset;
	}

	/**
	 * Get root element whch might be shadow root, GSElement, any parent element
	 * @param {HTMLElement} el 
	 * @returns {HTMLElement|ShadowRoot}
	 */
	static root(el) {

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
		if (typeof el === 'string') return GSDOM.getByID(document.documentElement, id);
		if (!(el && id)) return null;
		const it = GSDOM.walk(el, false);
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
		if (typeof el === 'string') return GSDOM.closest(document.documentElement, qry);
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
	static query(el, qry, all = false, shadow = true) {
		if (typeof el === 'string') return GSDOM.query(document.documentElement, el, all, shadow);
		if (!(el && qry)) return null;
		if (GSDOM.matches(el, qry)) return el;
		const it = GSDOM.walk(el, false, all, shadow);
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
	static queryAll(el, qry, all = false, shadow = true) {
		if (typeof el === 'string') return GSDOM.queryAll(document.documentElement, el, all, shadow);
		const res = [];
		if (!(el && qry)) return res;
		const it = GSDOM.walk(el, false, all, shadow);
		for (let o of it) {
			if (GSDOM.matches(o, qry)) res.push(o);
		}
		return res;
	}

	/**
	 * Set html text to provided element.
	 * NOTE: Done intentionaly like this to prevent source validation warning.
	 * @param {HTMLElement} el 
	 * @param {string} val 
	 * @returns {void}
	 */
	static setHTML(el, val = '') {
		// TODO - use sanitizer when not any more experimental feature; watch for default Sanitizer.getDefaultConfiguration()
		//if (el?.setHTML) return el.setHTML(val);
		const isValid = el instanceof ShadowRoot || el instanceof HTMLElement || el instanceof HTMLTemplateElement;
		if (isValid) el.innerHTML = val;
	}

	/**
	 * Set text to provided element
	 * @param {HTMLElement} el 
	 * @param {string} val 
	 * @returns {void}
	 */
	static setText(el, val = '') {
		if (el) el.textContent = val;
	}

	/**
	 * Set style to an element
	 * @param {HTMLElement|string} el 
	 * @param {object} obj 
	 */
	static css(el, obj) {
		if (GSUtil.isString(el)) el = GSDOM.queryAll(el);
		if (GSDOM.isHTMLElement(el)) el = [].concat(el);
		if (!(Array.isArray(el) && el.length > 0)) return false;
		requestAnimationFrame(() => {
			el.forEach(it => {
				Object.entries(obj).forEach(kv => {
					it.style[kv[0]] = kv[1];
				});
			});
		});
	}

	/**
	 * Safe way to toggle CSS class on element, multipel classes are supported in space separated string list
	 * @param {HTMLElement|string} el 
	 * @param {*} val list of css classes in space separated string
	 * @param {boolean} sts True to add, false to remove
	 * @returns {boolean}
	 */
	static toggleClass(el, val, sts) {
		if (GSUtil.isString(el)) el = GSDOM.queryAll(el);
		if (GSDOM.isHTMLElement(el)) el = [].concat(el);
		if (!(Array.isArray(el) && el.length > 0)) return false;
		if (!val || val.trim().length == 0) return false;
		val = val.split(' ').filter(v => v && v.trim().length > 0);
		if (GSUtil.isNull(sts)) return val.forEach(v => {
			el.forEach(it => it.classList.toggle(v));
		});
		el.forEach(it => {
			sts ? it.classList.add.apply(it.classList, val) : it.classList.remove.apply(it.classList, val);
		});
		return true;
	}

	/**
	 * Toggle element visibility
	 * @param {HTMLElement|string} el 
	 * @param {boolean} sts 
	 */
	static toggle(el, sts) {
		return GSDOM.toggleClass(el, 'd-none', GSUtil.isNull(sts) ? sts : !sts);
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
	 * Get proper value from element
	 * @param {HTMLElement} el 
	 * @returns {string|number}
	 */
	static getValue(el) {
        switch (el.type) {
            case 'datetime-local':
            case 'number':
                return el.value ? el.valueAsNumber : el.value;
            default:
                return el.value;
        }
    }

	/**
	 * Get value from form element
	 * @param {HTMLElement} el 
	 * @returns {string}
	 */
	static toValue(el) {
		if (!GSDOM.isHTMLElement(el)) return undefined;
		if ('checkbox' === el.type) return el.checked;
		let value = GSDOM.getValue(el);
		if ('text' === el.type) {
			const map = GSCSSMap.styleValue(el, 'text-transform');
			if (map) value = GSUtil.textTransform(map.value, value);
		}
		return value;
	}

	/**
	 * Set element value, taking chekbox into consideration
	 * @param {HTMLElement} el 
	 * @param {string|boolean|number} val 
	 * @returns 
	 */
	static fromValue(el, val) {
		if (!GSDOM.isHTMLElement(el)) return;
		if (el.type === 'checkbox') {
			el.checked = val == true;
		} else {
			el.value = val;
		}
	}

	/**
	 * Convert form elements into JSON object
	 * @param {HTMLElement} owner 
	 * @param {string} qry 
	 * @param {boolean} invalid Should include invalid fields
	 * @returns {object}
	 */
	static toObject(owner, qry = 'input, textarea, select', invalid = true) {
		const root = GSDOM.unwrap(owner);
		const params = {};
		const list = GSDOM.queryAll(root, qry); // root.querySelectorAll(qry);
		Array.from(list)
			.filter(el => el.name)
			.filter(el => el.dataset.ignore !== 'true')
			.filter(el => invalid ? true : el.checkValidity())
			.forEach(el => {
				params[el.name] = GSDOM.toValue(el);
			});
		return params;
	}

	/**
	 * Convert JSON Object into HTMLElements (input)
	 * @param {HTMLElement} owner Root selector (form)
	 * @param {object} obj Data source key/value pairs
	 * @param {string} qry Element type selector,defaults to form elements 
	 * @returns 
	 */
	static fromObject(owner, obj, qry = 'input, textarea, select') {
		if (!obj) return;
		const root = GSDOM.unwrap(owner);
		const list = GSDOM.queryAll(root, qry); // root.querySelectorAll(qry);
		Array.from(list)
			//.filter(el => el.name && Object.hasOwn(obj, el.name))
			.filter(el => el.name && el.name in obj)
			.forEach(el => GSDOM.fromValue(el, obj[el.name]));
	}

	/**
	 * Convert HTMLElement into a JSON object
	 * @param {HTMLElement} own 
	 * @param {boolean} recursive 
	 * @returns {object}
	 */
	static toJson(own, recursive = true) {
		const obj = {};
		if (!GSDOM.isHTMLElement(own)) return obj;

		obj['#tagName'] = own.tagName.toLowerCase();

		Array.from(own.attributes).forEach(v => obj[v.name] = v.value);

		if (recursive) {
			const children = Array.from(own.children);
			if (children.length > 0) {
				obj.items = [];
				children.forEach(el => obj.items.push(GSDOM.toJson(el)));
			}
		}

		return obj;
	}

	/**
	 * Convert JSON object to DOM/html
	 * @param {object} obj 
	 * @param {boolean} asString As string or HTMLElement Tree 
	 * @param {string} tag 
	 */
	static fromJson(obj, tag = 'gs-item', asString = false) {
		return asString ? GSDOM.fromJsonAsString(obj, tag) : GSDOM.fromJsonAsDOM(obj, tag);
	}

	/**
	 * Convert JSON object to DOM tree
	 * @param {*} obj 
	 * @param {*} tag 
	 */
	static fromJsonAsDOM(obj, tag = 'gs-item') {
		if (!obj) return null;

		if (Array.isArray(obj)) return obj.map(o => GSDOM.fromJsonAsDOM(o));

		const name = obj['#tagName'] || tag;
		const el = document.createElement(name);

		Object.keys(obj).filter(v => v != 'items' && v[0] != '#')
			.forEach(v => el.setAttribute(v, obj[v]));

		if (Array.isArray(obj.items)) {
			obj.items.forEach(o => {
				const sub = GSDOM.fromJsonAsDOM(o, tag);
				el.appendChild(sub);
			});
		}

		return el;
	}

	/**
	 * Convert JSON object to HTML source
	 * @param {*} obj 
	 * @param {*} tag 
	 */
	static fromJsonAsString(obj, tag = 'gs-item') {
		if (!obj) return null;

		if (Array.isArray(obj)) return obj.map(o => GSDOM.fromJsonAsString(o)).join('');

		const name = obj['#tagName'] || tag;
		const src = [];
		src.push(`<${name} `);

		Object.keys(obj).filter(v => v != 'items' && v[0] != '#')
			.forEach(v => src.push(` ${v}="${obj[v]}" `));

		src.push(`>`);

		if (Array.isArray(obj.items)) {
			obj.items.forEach(o => {
				const sub = GSDOM.fromJsonAsString(o, tag);
				src.push(sub);
			});
		}

		src.push(`</${name}>`);

		return src.join('');
	}

	/**
	 * Convert URL hash key/value to form elements
	 * @param {HTMLElement} owner 
	 */
	static fromURLHashToForm(owner) {
		location.hash.slice(1).split('&')
		.filter(v => v.length > 1)
		.forEach(v => {
			const d = v.split('=');
			GSDOM.setValue(`input[name=${d[0]}]`, d[1], owner);
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
		const el = GSDOM.queryAll(own, qry);
		el.forEach(it => GSDOM.fromValue(it, val));
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
	 * @param {HTMLElement} el Element which child list to validate
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
		return !(el instanceof Text || el instanceof Comment) && (!whiteList.includes(el.tagName));
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
			GSLog.error(null, e);
			sts = false;
		}
		return sts;
	}

	static {
		Object.seal(GSDOM);
		globalThis.GSDOM = GSDOM;
	}
}


