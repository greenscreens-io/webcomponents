/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSUtil from "./GSUtil.mjs";
import GSCacheStyles from "../head/GSCacheStyles.mjs";

/**
 * A module loading GSComponent class
 * @module base/GSComponents
 */

/**
 * Registry cache of all instantiated GS-* elements
 * @class
 */
export default class GSComponents {

    /**
     * Store GS-* elements
     */
    static #cache = new Map();

    /**
     * Store html elements extended with is=gs-* attribute
     */
    static #extra = new Map();

    /**
     * Store component in component registry cache
     * @param {GSElement} el - GSElement instance to store in component registry cache
     * @returns {void}
     */
    static store(el) {
        GSComponents.#storeElement(el);
        GSComponents.#storeExtra(el);
    }

    static #storeElement(el) {
        if (!GSUtil.isGSElement(el)) return false;
        this.#cache.set(el.id, el);
        requestAnimationFrame(() => GSUtil.sendEvent(document, 'gs-component', el));
    }

    static #storeExtra(el) {
        if (!GSUtil.isGSExtra(el)) return false;
        this.#extra.set(el.id, el);
        requestAnimationFrame(() => GSUtil.sendEvent(document, 'gs-component', el));
    }

    /**
     * Remove component from component registry cache by id or GSElement instance
     * @param {GSElement|string} el 
     * @returns {void}
     */
    static remove(el) {
        if (typeof el === 'string') {
            this.#cache.delete(el);
            this.#extra.delete(el);
        }
        if (GSUtil.isGSElement(el)) this.#cache.delete(el.id);
        if (GSUtil.isGSExtra(el)) this.#extra.delete(el.id);
    }

    /**
     * Get component from component cache by component id
     * @param {string} id 
     * @returns {GSElement}
     */
    static get(id = '') {
        let el = this.#cache.get(id);
        if (!el) el = this.#extra.get(id);
        return el;
    }

    /**
     * Find all elements that match target query
     * @param {HTMLElement} own Owner element 
     * @param {string} tgt Target element selector
     * @returns {Array<HTMLElement>}
     */
    static findTarget(own, tgt) {
        const me = own;
        if (!tgt) return [];
        const parent = GSUtil.parent(me);
        // in parent tree
        let target = GSUtil.findAll(tgt, parent, true);
        // in parent shadow
        if (target.length === 0) target = GSUtil.findAll(tgt, GSUtil.unwrap(parent), true);
        // whole document
        if (target.length === 0) target = GSUtil.findAll(tgt, document, true);
        // all component shadows
        if (target.length === 0) target = GSComponents.queryAll(tgt);
        return target;
    }

    /**
     * Find all elements matched by CSS selector in all shadow doms
     * @param {string} value A CSS query selector
     * @returns {Array<HTMLElement>}
     */
    static queryAll(value = '') {
        const data = GSComponents.findAll(null, true, true)
            .filter(el => GSUtil.isFunction(el.findAll))
            .map(el => Array.from(el.findAll(value)))
            .filter(o => o.length > 0)
            .flat();
        return GSUtil.uniqe(data);
    }

    /**
     * Find first element matched by CSS selector in all shadow doms
     * @param {string} value A css query selector
     * @returns {HTMLElement}
     */
    static query(value = '') {
        return GSComponents.findAll(null, true, true)
                .filter(el => GSUtil.isFunction(el.findEl))
                .map(el => el.findEl(value))
                .filter(o => o != null)
                .shift();
    }

    static #waitForInternal(name = '', timeout = 0, r) {
        const fn = (e) => {
            const el = e.detail;
            const isComp = name.startsWith('gs-') && el.tagName === name.toUpperCase();
            if (isComp || el.id === name) {
                GSUtil.unlisten(document, null, 'gs-component', fn);
                return r(el);
            }
        };
        const opt = {once:true, capture : false};
        if(timeout > 0) opt.signal = AbortSignal.timeout(timeout);
        GSUtil.listen(document, null, 'gs-component', fn, opt);
    }

    /**
     * Wait for GSElement to become registered (initialized)
     * @param {string} name A name of GSComponent type (gs-form, etc...)
     * @returns {GSElement}
     */
    static waitFor(name = '', timeout = 0) {
        return new Promise((r, e) => {
            let el = GSComponents.find(name);
            if (!el) el = GSComponents.get(name);
            if (el) return r(el);
            GSComponents.#waitForInternal(name, timeout, r);
        });
    }

    /**
     * Notify when GSElement is registered, 
     * @param {*} name Element id or GS-* tagName
     * @param {*} fn Callback function
     */
    static notifyFor(name = '', fn) {
        if (!GSUtil.isFunction(fn)) return false;
        const callback = (e) => {
            const el = e.path[0];
            const ok = el.id === name || el.tagName === name;
            if (!ok) return ;
            fn(el, e);
        };
        GSUtil.listen(document.body, null, 'componentready', callback);
        return callback;
    }

    /**
     * Get all components of a specific type
     * @param {string} name - component name GS-*
     * @param {boolean} flat - return only flat components
     * @param {boolean} shadow  - return only shadowed components
     * @returns {Array<GSElement>}
     */
    static findAll(name = '', flat = true, shadow = true) {
        const me = this;
        let result = null;
        if (name) {
            result = GSComponents.findAllElements(name);
            result = result.concat(GSComponents.findAllExtra(name));
        } else {
            result = Array.from(me.#cache.values()).concat(Array.from(me.#extra.values()));
        }

        if (!flat) result = result.filter(el => el.shadowRoot);
        if (!shadow) result = result.filter(el => !el.shadowRoot);

        return result;
    }

    /**
     * Find first GS component
     * @param {string} name - component name GS-*
     * @param {boolean} flat - only flat components
     * @param {boolean} shadow  - only shadowed components
     * @returns {GSElement}
     */
    static find(name = '', flat = true, shadow = true) {
        return GSComponents.findAll(name, flat, shadow).shift();
    }

    static #filterAllString(list, name) {
        const str = name.toUpperCase();
        return Array.from(list.values()).filter(v => v.tagName === str || GSUtil.getAttribute(v, 'is', '').toUpperCase() === str);
    }

    static #filterAll(list, name) {
        return Array.from(list.values()).filter(v => v instanceof name);
    }

    static findAllElements(name = '') {
        const me = this;
        if (typeof name === 'string') return GSComponents.#filterAllString(me.#cache, name);
        return GSComponents.isElement(name) ? GSComponents.#filterAll(me.#cache, name) : [];
    }

    static findAllExtra(name = '') {
        const me = this;
        if (typeof name === 'string') return GSComponents.#filterAllString(me.#extra, name);
        return GSComponents.isExtra(name) ? GSComponents.#filterAll(me.#extra, name) : [];
    }

    /**
     * Is element gs-* type
     * @param {string} name A GSElement tag name
     * @returns {boolean}
     */
    static isElement(name = '') {
        return GSUtil.isGSElement(name) || GSUtil.isGSElement(name.prototype);
    }

    /**
     * If standard element has "is"=gs-* attribute
     * @param {string} name 
     * @returns {boolean}
     */
    static isExtra(name = '') {
        return GSUtil.isGSExtra(name) || GSUtil.isGSExtra(name.prototype)
    }

    /**
    * Returns owner of this shadowRoot element
    * @param {HTMLElement} el An instance of HTMLElement
    * @param {string} type A tag name of searched element
    * @returns {HTMLElement} A parent of provided element
    */
    static getOwner(el, type) {
        const isEl = GSUtil.isGSElement(el) || GSUtil.isHTMLElement(el);
        if (!isEl) return null;

        const it = GSUtil.parentAll(el);
        for (let v of it) {
            if (!v) break;
            if (v instanceof ShadowRoot) {
                const parent = GSUtil.parent(v);
                if (!type) return parent;
                if (GSUtil.isElement(parent, type)) return parent;
                return GSComponents.getOwner(parent, type);
            }
            if (GSUtil.isElement(v, type)) return v;
        }

        return type ? null : GSUtil.parent(el);
    }

    /**
     * Check if class instance has defined property getter 
     * @param {object} own Class instance
     * @param {string} name Getter name to check
     * @returns {boolean} Returns true if getter exist
     */
    static hasGetter(own, name) {
        return GSComponents.hasFunc(own, name, 'get');
    }

    /**
     * Check if class instance has defined property setter 
     * @param {object} own Class instance
     * @param {string} name Getter name to check
     * @returns {boolean} Returns true if setter exist
     */
    static hasSetter(own, name) {
        return GSComponents.hasFunc(own, name, 'set');
    }

    /**
     * Check if class instance has defined function
     * @param {object} own Class instance
     * @param {string} name Function name to check
     * @param {string} fn Function name to check
     * @returns {boolean} Returns true if getter exist
     */
    static hasFunc(own, name, fn) {
        const desc = Reflect.getOwnPropertyDescriptor(own.__proto__, name);
        return desc && typeof desc[fn] === 'function';
    }

    /**
     * Listen for global WebComponent css style changes to reapply to active componentes
     * @returns {void}
     */
    static listenStyles() {
        if (GSComponents.#listener) return;
        document.addEventListener('gs-style', GSComponents.#onStyles);
        GSComponents.#listener = true;
    }

    /**
     * Remove global WebComponent css style changes listner 
     * @returns {void}
     */
    static unlistenStyles() {
        document.removeEventListener('gs-style', GSComponents.#onStyles);
        GSComponents.#listener = false;
    }

    static #listener = false;
    static #onStyles() {
        requestAnimationFrame(() => {
            GSComponents.findAll().filter(el => el.shadowRoot).forEach(el => el.shadowRoot.adoptedStyleSheets = GSCacheStyles.styles);
        });
    }

    static {
        Object.freeze(GSComponents);
        GSComponents.listenStyles();
        window.GSComponents = GSComponents;
    }

}

