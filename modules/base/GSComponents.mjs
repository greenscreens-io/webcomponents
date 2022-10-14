/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSCacheStyles from "../head/GSCacheStyles.mjs";
import GSEvent from "./GSEvent.mjs";
import GSFunction from "./GSFunction.mjs";
import GSDOM from "./GSDOM.mjs";

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
    static #cache = new Set();

    /**
     * Store component in component registry cache
     * @param {GSElement} el - GSElement instance to store in component registry cache
     * @returns {void}
     */
    static store(el) {
        GSComponents.#cache.add(el);
    }

    /**
     * Remove component from component registry cache by id or GSElement instance
     * @param {GSElement|string} el 
     * @returns {void}
     */
    static remove(el) {
        GSComponents.#cache.delete(el);
    }

    /**
     * Get component from component cache by component id
     * @param {string} id 
     * @returns {GSElement}
     */
    static get(id = '') {
        if (!id) return null;
        const els = Array.from(this.#cache).filter(el => el.id === id);
        return els.length === 0 ? null : els[0];
    }

    static #waitForInternal(name = '', timeout = 0, r) {
        const fn = (e) => {
            const el = e.detail;
            const isComp = name.startsWith('gs-') && el.tagName === name.toUpperCase();
            if (isComp || el.id === name) {
                GSEvent.unlisten(document.body, null, 'componentready', fn);
                return r(el);
            }
        };
        const opt = { once: false, capture: false };
        if (timeout > 0) opt.signal = AbortSignal.timeout(timeout);
        GSEvent.listen(document.body, null, 'componentready', fn, opt);
    }

    /**
     * Wait for GSElement to become registered (initialized)
     * @param {string} name A name of GSComponent type (gs-ext-form, etc...)
     * @returns {GSElement}
     */
    static waitFor(name = '', timeout = 0) {
        return new Promise((r, e) => {
            let el = GSComponents.find(name) || GSComponents.get(name);
            return el ? r(el) : GSComponents.#waitForInternal(name, timeout, r);
        });
    }

    /**
     * Notify when GSElement is registered, 
     * @param {*} name Element id or GS-* tagName
     * @param {*} fn Callback function
     */
    static notifyFor(name = '', fn) {
        if (!GSFunction.isFunction(fn)) return false;
        const callback = (e) => {
            const el = e.composedPath().shift();
            const ok = el.id === name || el.tagName === name;
            return ok ? fn(el, e) : undefined;
        };
        const el = GSComponents.find(name) || GSComponents.get(name);
        if (el) return fn(el);
        GSEvent.listen(document.body, null, 'componentready', callback);
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
        
        let result = Array.from(GSComponents.#cache);
        if (name) result = result.filter(el => el && GSDOM.matches(el, name));       
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

    /**
    * Returns owner of this shadowRoot element
    * @param {HTMLElement} el An instance of HTMLElement
    * @param {string} type A tag name of searched element
    * @returns {HTMLElement} A parent of provided element
    */
    static getOwner(el, type) {
        const isEl = GSDOM.isGSElement(el) || GSDOM.isHTMLElement(el);
        if (!isEl) return null;

        const it = GSDOM.parentAll(el);
        for (let v of it) {
            if (!v) break;
            if (v instanceof ShadowRoot) {
                const parent = GSDOM.parent(v);
                if (!type) return parent;
                if (GSDOM.isElement(parent, type)) return parent;
                return GSComponents.getOwner(parent, type);
            }
            if (GSDOM.isElement(v, type)) return v;
        }

        return type ? null : GSDOM.parent(el);
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
            GSComponents.findAll(null, false, true).filter(el => el.shadowRoot).forEach(el => el.shadowRoot.adoptedStyleSheets = GSCacheStyles.styles);
        });
    }

    static {
        Object.freeze(GSComponents);
        GSComponents.listenStyles();
        window.GSComponents = GSComponents;
    }

}
