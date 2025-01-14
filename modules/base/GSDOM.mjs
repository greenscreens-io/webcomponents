/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

/**
 * A module loading GSDOM class
 * @module base/GSDOM
 */

import { GSCSSMap } from "./GSCSSMap.mjs";
import { GSData } from "./GSData.mjs";
import { GSLog } from "./GSLog.mjs";
import { GSUtil } from "./GSUtil.mjs";

/**
 * A generic set of static functions to handle DOM tree and DOM elements
 * @class
 */
export class GSDOM {

	static QUERY_FOCUSABLE = "a[href]:not([tabindex='-1']),area[href]:not([tabindex='-1']),input:not([disabled]):not([tabindex='-1']),select:not([disabled]):not([tabindex='-1']),textarea:not([disabled]):not([tabindex='-1']),button:not([disabled]):not([tabindex='-1']),iframe:not([tabindex='-1']),[tabindex]:not([tabindex='-1']),[contentEditable=true]:not([tabindex='-1'])";
	static QUERY_INPUT = "input:not([type='hidden']):not(disabled):not(readonly),select:not([type='hidden']):not(disabled):not(readonly),textarea:not([type='hidden']):not(disabled):not(readonly)";
	static #FORMEL = ['INPUT', 'SELECT', 'TEXTAREA', 'OUTPUT'];
	//static #CLEANUP1 = /(\n*\t*)*(?=\n\t*)/g
	static #CLEANUP1 = /(?:\n+\t*)+/g

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
	 * @returns {Boolean}
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
	* @param {String} html Source to parse
	* @param {Boolean} single Return first element or all
	* @param {String} mime Src mime type
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
	 * @param {String} src 
	 * @returns {HTMLElement}
	 */
	static parseWrapped(own, src = '', forceWrap = false) {

		const doc = GSDOM.parse(src);
		const head = GSDOM.#fromNode(doc.head.children);
		const body = GSDOM.#fromNode(doc.body.children);

		const nodes = [...head, ...body];

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
	 * @returns {Boolean}
	 */
	static isFormElement(el) {
		const name = GSUtil.isString(el) ? el : el?.tagName;
		return GSDOM.#FORMEL.includes(name);
	}

	/**
	 * Return all form elements for a given root element
	 * @param {HTMLElement} el 
	 * @returns 
	 */
	static formElements(el) {
		return GSDOM.queryAll(el, GSDOM.#FORMEL.map(v => v.toLowerCase()));
	}

	/**
	 * Check if element is button
	 * @param {HTMLElement} el 
	 * @returns {Boolean}
	 */
	static isButtonElement(el) {
		return (el instanceof HTMLButtonElement)
			|| el?.tagName === 'GS-BUTTON'
			|| GSDOM.hasClass(el, 'btn');
	}

	/**
	  * Check if given element is of given type 
	  * 
	  * @param {HTMLElement} el
	  * @param {String|class} type Tag Name, class name or Class
	  * @returns {Boolean}
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
	 * Check if given element is of type HTMLSlotElement
	 * @returns {Boolean}
	 */	
	static isSlotElement(el) {
		return el instanceof HTMLSlotElement;
	}

	/**
	 * Check if given element is of type HTMLElement
	 * @returns {Boolean}
	 */
	static isTemplateElement(el) {
		return el instanceof HTMLTemplateElement;
	}

	/**
	 * Check if given element is of type HTMLElement
	 * @returns {Boolean}
	 */
	static isHTMLElement(el) {
		return el instanceof HTMLElement;
	}

	/**
	 * Check if given element is of type SVGElement
	 * @returns {Boolean}
	 */
	static isSVGElement(el) {
		return el instanceof SVGElement;
	}

	/**
	 * Check if given element is of type Text
	 * @returns {Boolean}
	 */
	static isText(el) {
		return el instanceof Text;
	}

	/**
	 * Check if given element is of type Comment
	 * @returns {Boolean}
	 */
	static isComment(el) {
		return el instanceof Comment;
	}

	/*
	 * Check if given element is of type GSElement
	 * @returns {Boolean}
	 */
	static isGSElement(el) {
		if (!el?.clazzName) return false;
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
	 * @returns {Boolean}
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
	 * @param {Boolean} orientation 
	 * @returns {Boolean}
	 */
	static hide(el, orientation = false) {
		return el?.classList?.add(orientation ? 'gs-hide-orientation' : 'gs-hide');
	}

	/**
	 * Show html element
	 * @param {HTMLElement} el 
	 * @param {Boolean} orientation 
	 * @returns {Boolean}
	 */
	static show(el, orientation = false) {
		return el?.classList?.remove(orientation ? 'gs-hide-orientation' : 'gs-hide');
	}

	/**
	 * Add node as next in list of nodes
	 * @param {HTMLElement} target 
	 * @param {HTMLElement} newEl 
	 * @returns {Boolean}
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
	 * @returns {Boolean}
	 */
	static appendChild(target, newEl) {
		const isok = GSDOM.isHTMLElement(target) && GSDOM.isHTMLElement(newEl);
		return isok && target !== newEl ? target.appendChild(newEl) : false;
	}

	/**
	 * Add node to a target at specified place
	 * @param {HTMLElement} target 
	 * @param {HTMLElement} newEl 
	 * @param {String} placement
	 * @returns {Boolean}
	 */
	static insertAdjacent(target, newEl, placement) {
		const isok = GSDOM.isHTMLElement(target) && GSDOM.isHTMLElement(newEl);
		const invalid = target === newEl && target.parentNode === newEl
		return isok && !invalid ? target.insertAdjacentElement(placement, newEl) : false;
	}

	/**
	 * Remove genarated componnt from parent
	 * @param {HTMLElement} el 
	 * @returns {Boolean}
	 */
	static removeElement(el) {
		return GSDOM.parent(el)?.removeChild(el);
	}

	/**
	 * Walk node tree
	 * 
	 * @param {HTMLLegendElement} node Start node to walk from 
	 * @param {Boolean} closest Direction down (false) or up (true)
	 * @param {Boolean} all  Filter HTMLElements (false) only or text also (true) (only down)
	 * @param {Boolean} shadow Traverse shadow DOM also (only down)
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
	 * @param {*} shadow Include traversing across shadow tree
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
	 * Get WebComponent owning element inside rendered shadow root
	 * @param {HTMLElement} el 
	 * @returns {HTMLElement}
	 */
	static component(el) {
		return GSDOM.parent(GSDOM.root(el));
	}

	/**
	 * Get node index between siblings
	 * @param {HTMLElement} node 
	 * @returns {Number}
	 */
	static getElementIndex(node) {
		if (!GSDOM.isHTMLElement(node)) return 0;
		return [...node.parentElement.children].indexOf(node);
	}

	/**
	 * Find element by ID within DOM Tree across Shadow DOM
	 * @param {HTMLElement} el Root node to start from
	 * @param {String} id Element id
	 * @returns {HTMLElement} 
	 */
	static getByID(el, id) {
		if (typeof el === 'string') return GSDOM.getByID(document.documentElement, el);
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
	 * @param {String} qry CSS query
	 * @param {Number} level How many levels to wal, 0 = all
	 * @returns {HTMLElement} 
	 */
	static closest(el, qry, levels = 0) {
		if (typeof el === 'string') return GSDOM.closest(document.documentElement, qry);
		if (!(el && qry)) return null;
		levels = GSUtil.asNum(levels, 0);
		const limit = levels > 0;
		const it = GSDOM.walk(el, true);
		for (let o of it) {
			if (GSDOM.matches(o, qry)) return o;
			if (limit && --levels == 0) return null;
		}
		return null;
	}

	/**
	 * Query DOM tree with support for Shadow DOM
	 * 
	 * @param {HTMLElement} el Root node to start from
	 * @param {String} qry CSS query
	 * @returns {HTMLElement} 
	 */
	static query(el, qry, all = false, shadow = true) {
		if (typeof el === 'string') return GSDOM.query(document.documentElement, el, all, shadow);
		if (!(el && qry)) return null;
		if (GSDOM.matches(el, qry)) return GSDOM.#proxy(el);
		const it = GSDOM.walk(el, false, all, shadow);
		for (let o of it) {
			if (GSDOM.matches(o, qry)) return GSDOM.#proxy(o);
		}
		return null;
	}

	/**
	 * Query DOM tree with support for Shadow DOM
	 * 
	 * @param {HTMLElement} el Root node to start from
	 * @param {String} qry CSS query
	 * @returns {Array<HTMLElement>}
	*/
	static queryAll(el, qry, all = false, shadow = true) {
		if (typeof el === 'string') return GSDOM.queryAll(document.documentElement, el, all, shadow);
		const res = [];
		if (!(el && qry)) return res;
		const it = GSDOM.walk(el, false, all, shadow);
		for (let o of it) {
			if (GSDOM.matches(o, qry)) res.push(GSDOM.#proxy(o));
		}
		return res;
	}

	/**
	 * Overide native to prevent DOM issue when input field name=id
	 * @returns{Proxy}
	 */
	static #proxy(el) {
		if (el.tagName !== 'FORM') return el;
		if (!GSDOM.isHTMLElement(el.id)) return el;
		return new Proxy(el, {
			get: function (target, prop, receiver) {
				if (prop === '_owner_') return target;
				if (prop === 'id') return target.getAttribute('id');
				const res = Reflect.get(target, prop);
				return GSFunction.isFunction(res) ? res.bind(target) : res;
			},
			set: function (target, prop, value) {
				return target[prop] = value;
			}
		});
	}

	/**
	 * Match element against CSS query
	 * @param {HTMLElement} el 
	 * @param {String} qry 
	 * @returns {Boolean}
	 */
	static matches(el, qry) {
		// return el && qry && typeof el.matches === 'function' && el.matches(qry);
		return el && typeof el.matches === 'function' && el.matches(qry);
	}

	/**
	 * Set html text to provided element.
	 * NOTE: Done intentionaly like this to prevent source validation warning.
	 *       Use sanitizer when not any more experimental feature;
	 *       Watch for default Sanitizer.getDefaultConfiguration()
	 * @param {HTMLElement} el 
	 * @param {String} val 
	 * @param {Boolean} sanitize 
	 * @param {Sanitizer} sanitizer 
	 * @returns {void}
	 */
	static setHTML(el, val = '', sanitize = false, sanitizer) {
		const isValid = el instanceof ShadowRoot || el instanceof HTMLElement || el instanceof HTMLTemplateElement;
		if (!isValid) return;
		if (sanitize && el?.setHTML) {
			sanitizer ? el.setHTML(val, { sanitizer }) : el.setHTML(val);
		} else {
			el.innerHTML = val instanceof Document ? val.body.innerHTML : val;
		}
	}

	/**
	 * Set text to provided element
	 * @param {HTMLElement} el 
	 * @param {String} val 
	 * @returns {void}
	 */
	static setText(el, val = '') {
		if (el) el.textContent = val;
	}

	/**
	 * Set style to an element
	 * @param {HTMLElement|string} el 
	 * @param {Object} obj 
	 */
	static css(el, obj) {
		if (GSUtil.isString(el)) el = GSDOM.queryAll(el);
		if (GSDOM.isHTMLElement(el)) el = [el];
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
	 * @param {Boolean} sts True to add, false to remove
	 * @returns {Boolean}
	 */
	static toggleClass(el, val, sts) {
		if (GSUtil.isString(el)) el = GSDOM.queryAll(el);
		if (GSDOM.isHTMLElement(el)) el = [el];
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
	 * @param {Boolean} sts 
	 */
	static toggle(el, sts) {
		return GSDOM.toggleClass(el, 'd-none', GSUtil.isNull(sts) ? sts : !sts);
	}

	/**
	 * Checks if element contains a css class
	 * @param {HTMLElement} el 
	 * @param {String} val 
	 * @returns {Boolean}
	 */
	static hasClass(el, val = '') {
		return el?.classList?.contains(val);
	}

	/**
	 * Alternative way to clear fields instead of form.reset()
	 * @param {HTMLElement} owner 
	 * @param {String} qry 
	 */
	static clearInputs(owner, qry = 'input, textarea, output') {
		const root = GSDOM.unwrap(owner);
		requestAnimationFrame(() => {
			root.querySelectorAll(qry).forEach((el) => el.value = '');
		});
	}

	/**
	 * Get proper value from element
	 * @param {HTMLElement} el 
	 * @returns {String|Number}
	 */
	static getValue(el) {
		switch (el.type) {
			case 'datetime-local':
			case 'number':
				return el.value ? el.valueAsNumber : el.value;
			case 'select-multiple':
				return Array.from(el.selectedOptions).map(o => o.value);
			case 'checkbox':
				if (el.hasAttribute('value') && el.value) {
					return el.checked ? el.value : null;
				}
				return el.checked;
			default:
				return el.value;
		}
	}

	/**
	 * Get value from form element
	 * @param {HTMLElement} el 
	 * @returns {String}
	 */
	static toValue(el) {
		if (!GSDOM.isHTMLElement(el)) return undefined;
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
	 * @param {String|Boolean|Number} val 
	 */
	static fromValue(el, val) {
		if (!GSDOM.isHTMLElement(el)) return;
		const data = Array.isArray(val) ? val[0] || '' : val;

		switch (el.type) {
			case 'checkbox':
				if (el.hasAttribute('value')) {
					el.checked = data === el.value;
				} else {
					el.checked = data == true;
				}
				break;
			default:
				el.value = GSUtil.normalize(data);
		}
	}

	/**
	 * Convert form elements into JSON object
	 * @param {HTMLElement} owner 
	 * @param {String} qry 
	 * @param {Boolean} invalid Should include invalid fields
	 * @returns {Object}
	 */
	static toObject(owner, qry = 'input, textarea, select, output', invalid = true) {
		const root = GSDOM.unwrap(owner);
		const params = {};
		GSDOM.queryAll(root, qry)
			.filter(el => el.name)
			.filter(el => el.dataset.ignore !== 'true')
			.filter(el => invalid ? true : el.checkValidity())
			.forEach(el => {
				if (el.type !== 'radio') {
					//params[el.name] = GSDOM.toValue(el);
					GSData.writeToOject(params, el.name, GSDOM.toValue(el));
				} else if (el.checked) {
					//params[el.name] = GSDOM.toValue(el);
					GSData.writeToOject(params, el.name, GSDOM.toValue(el));
				}
			});
		return params;
	}

	/**
	 * Convert JSON Object into HTMLElements (input)
	 * @param {HTMLElement} owner Root selector (form)
	 * @param {Object} obj Data source key/value pairs
	 * @param {String} qry Element type selector,defaults to form elements 
	 * @returns {Object}
	 */
	static fromObject(owner, obj, qry = 'input, textarea, select, output') {
		obj = GSUtil.toJson(obj);
		// if (Object.entries(obj).length === 0) return;
		const root = GSDOM.unwrap(owner);
		const list = GSDOM.queryAll(root, qry); // root.querySelectorAll(qry);
		Array.from(list).forEach(el => GSDOM.fromObject2Element(el, obj));
		return obj;
	}

	/**
	 * Convert JSON Object into HTMLElement (input)
	 * @param {HTMLElement} owner Element to populate
	 * @param {Object} obj Data source key/value pairs
	 */
	static fromObject2Element(el, obj) {
		if (!GSData.objectPathExist(obj, el?.name)) return;
		const val = GSData.readFromObject(obj, el.name);
		if (el.type !== 'radio') {
			//GSDOM.fromValue(el, obj[el.name]);
			GSDOM.fromValue(el, val);
		} else if (el.value === val) el.checked = true;
	}

	/**
	 * Convert HTMLElement into a JSON object
	 * @param {HTMLElement|Array} own 
	 * @param {Boolean} recursive 
	 * @param {Boolean} plain  
	 * @returns {Object}
	 */
	static toJson(own, recursive = true, plain = false) {
		if (Array.isArray(own)) return own.map(o => GSDOM.toJson(o, recursive));
		const obj = {};
		if (!GSDOM.isHTMLElement(own)) return obj;

		if (!plain) obj['#tagName'] = own.tagName.toLowerCase();
		obj['$text'] = own.innerText;

		Array.from(own.attributes).forEach(v => obj[v.name] = v.value);

		if (recursive) {
			const children = Array.from(own.children).map(el => GSDOM.toJson(el, recursive, plain));
			if (children.length > 0) obj.items = children;
		}

		return obj;
	}

	/**
	 * Convert JSON object to DOM/html
	 * @param {Object} obj 
	 * @param {Boolean} asString As string or HTMLElement Tree 
	 * @param {String} tag 
	 */
	static fromJson(obj, tag = 'gs-item', asString = false) {
		return asString ? GSDOM.fromJsonAsString(obj, tag) : GSDOM.fromJsonAsDOM(obj, tag);
	}

	/**
	 * Convert JSON object to DOM tree
	 * @param {Object} obj 
	 * @param {String} tag 
	 * @returns {HTMLElement|Array}
	 */
	static fromJsonAsDOM(obj, tag = 'gs-item') {
		if (!obj) return null;

		const isPrimitive = GSUtil.isNumber(obj) || GSUtil.isString(obj);
		if (isPrimitive) return GSDOM.fromJsonAsDOM({ title: obj }, tag);

		const isArray = Array.isArray(obj);
		if (isArray) return obj.map(o => GSDOM.fromJsonAsDOM(o, tag));

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
	 * @param {Object} obj 
	 * @param {String} tag 
	 * @returns {String}
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
	 * @param {String} qry Default to form
	 */
	static enableInput(own, qry = 'input, select, textarea, .btn', all = true, group = '') {
		let list = GSDOM.queryAll(own, qry);
		if (!all && group) list = list.filter(el => GSUtil.asBool(el.dataset[group]))
		list.forEach(el => el.removeAttribute('disabled'));
	}

	/**
	 * Disable input on all input elements under provided owner
	 * @param {HTMLElement} own 
	 * @param {String} qry Default to form
	 */
	static disableInput(own, qry = 'input, select, textarea, .btn', all = true, group = '') {
		GSDOM.queryAll(own, qry)
			.filter(el => all ? true : !el.disabled)
			.forEach(el => {
				el.setAttribute('disabled', '');
				if (group) el.dataset[group] = true;
			});
	}

	/**
	 * Set value to a element by css selector
	 * @param {String} qry 
	 * @param {String} val 
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
		ts.forEach(t => t.nodeValue = t.wholeText.replaceAll(/\u0020{4}/g, '\t').replaceAll(GSDOM.#CLEANUP1, ''));
	}

	/**
	 * Validate against provided list, if child elements allowed inside provided element
	 * @param {HTMLElement} el Element which child list to validate
	 * @param {String} tagName Expected owner element tag name
	 * @param {String} whiteList Uppercase list of tag names allowed as child
	 * @param {String} slotList List of named slots allowed
	 * @param {Boolean} asState return state as bool or throw an error (default)
	 * @returns {Boolean} return true if validation is ok.
	 * @throws {Error}
	 */
	static validate(own, tagName, whiteList, asState = false) {
		if (own.tagName !== tagName) {
			if (asState) return false;
			throw new Error(`Owner element : ${own.tagName}, id:${own.id} is not of excpected type: ${tagName}`);
		}
		const ok = GSDOM.isAllowed(Array.from(own.childNodes), whiteList);
		if (ok) return true;
		if (asState) return false;
		const msg = GSDOM.toValidationError(own, whiteList);
		throw new Error(msg);
	}

	/**
	 * Check against provided list, if child elements allowed inside provided element
	 * @param {HTMLElement|Array<HTMLElement>} el Element which childs to validate against provided list
	 * @param {String} whiteList Uppercase list of tag names allowed as child nodes
	 * @param {String} slotList List of elements with named  slots allowed
	 * @returns {Boolean} return tr ue if validation is ok.
	 */
	static isAllowed(el, whiteList) {
		if (Array.isArray(el)) return el.filter(el => GSDOM.isAllowed(el, whiteList)).length === 0;
		const allowElement = !(el instanceof Text || el instanceof Comment);
		const allowTag = !whiteList.includes(el.tagName);
		return allowElement && allowTag;
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
	 * @param {String} url 
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


