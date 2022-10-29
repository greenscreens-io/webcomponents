/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDOMObserver class
 * @module base/GSDOMObserver
 */

/**
 * Generic HTMLElement node add/remove from DOM tree.
 * This Class accepts filter/callback function registration
 * as creation of independent observers for each Shadow DOM.
 * NOTE: Shadow dom must have independent observers!!!
 * Mostly used for dynamic attaching events to the elements not extended with is="gs-*"
 * @class
 * @extends MutationObserver
 */
export default class GSDOMObserver extends MutationObserver {

    static #filtersAdd = new Map();
    static #filtersDel = new Map();

    /**
     * Observe element for insertion / deletion
     * @param {HTMLElement} el A HTMLElement instance to observe for child changes
     * @param {object} opt A JSON configuration object
     * @returns {boolean} A satus of successfull observer registration
     */
    observe(el, opt) {
        const cfg = opt || { childList: true, subtree: true };
        return super.observe(el, cfg);
    }

    /**
     * Create a new observer instance for given root element
     * @param {HTMLElement} el An element to monitor for changes 
     * @returns {GSDOMObserver}
     */
    static create(el) {
        const observer = new GSDOMObserver(GSDOMObserver.#onObserve);
        observer.observe(el);
        return observer;
    }

    /**
     * Get add or remove filter
     * @param {boolean} forRemove If "true", return injection filter functions, elseremoval functions
     * @returns {Map<Function, Function>} Returns map of filter functions
     */
    static #getFilter(forRemove = false) {
        return forRemove ? GSDOMObserver.#filtersDel : GSDOMObserver.#filtersAdd;
    }

    /**
     * Is there any filter registered
     */
    static get #hasFilters() {
        return GSDOMObserver.#hasFiltersAdd || GSDOMObserver.#hasFiltersDel;
    }

    static get #hasFiltersAdd() {
        return GSDOMObserver.#filtersAdd.size > 0;
    }

    static get #hasFiltersDel() {
        return GSDOMObserver.#filtersDel.size > 0;
    }

    /**
     * Observer callback to filter elements
     * @param {*} mutations 
     */
    static #onObserve(mutations) {
        if (!GSDOMObserver.#hasFilters) return;
        mutations.forEach((mutation) => {
            if (GSDOMObserver.#hasFiltersAdd) mutation.addedNodes.forEach(el => GSDOMObserver.#walk(el, GSDOMObserver.#filtersAdd));
            if (GSDOMObserver.#hasFiltersDel) mutation.removedNodes.forEach(el => GSDOMObserver.#walk(el, GSDOMObserver.#filtersDel));
        });
    }

    /**
     * Walk node tree
     * @param {HTMLElement} rootEL node root
     * @param {Map} filters
     * @returns {boolean} 
     */
    static #walk(rootEL, filters) {
        if (filters.size === 0) return false;
        GSDOMObserver.#parse(rootEL, filters);
        rootEL.childNodes.forEach(el => GSDOMObserver.#walk(el, filters));
        return true;
    }

    /**
     * Call filter and callback function if node accepted
     * @param {HTMLElement} el node root
     * @param {Map} filters
     * @returns {void}
     */
    static #parse(el, filters) {
        filters.forEach((v, k) => {
            try {
                if (k(el)) v(el);
            } catch (e) {
                console.log(e);
            }
        });
    }

    /**
     * Execute observer logic 
     * 
     * @param {HTMLElement} el node root
     * @param {Function} filter function to filter nodes
     * @param {Function} callback function to be called on selected node
     * 
     * @returns {boolean}
     */
    static #exec(el, filter, callback) {
        if (el instanceof HTMLElement == false) return false;
        const tmp = new Map();
        tmp.set(filter, callback);
        return GSDOMObserver.#walk(el, tmp);
    }

    /**
     * Check if parameter is function
     * @param {function} fn 
     * @returns {boolean} true if parameter is function type
     */
    static #isFunction(fn) {
        return typeof fn === 'function';
    }

    /**
     * Check if registration functions are valid
     * @param {Function} filter function to filter nodes
     * @param {Function} callback function to be called on selected node
     * @returns {boolean}
     */
    static #isFunctions(filter, callback) {
        return GSDOMObserver.#isFunction(filter) && GSDOMObserver.#isFunction(callback);
    }

    /**
     * Register element filter
     * 
     * @param {Function} filter - filter function returns true
     * @param {Function} callback - result function
     * @param {boolean} forRemove - call on node remove or add
     * 
     * @returns {boolean} Returns true if filter registered
     */
    static registerFilter(filter, callback, forRemove = false) {

        if (!GSDOMObserver.#isFunctions(filter, callback)) return false;

        GSDOMObserver.#getFilter(forRemove).set(filter, callback);

        // initially loaded does not trigger 
        if (!forRemove) GSDOMObserver.#exec(document.body, filter, callback);

        return true;
    }

    /**
     * Unregister element filter
     * 
     * @param {Function} fn Filter function
     * @param {boolean} forRemove Call on node remove or add
     * 
     * @returns {boolean} Returns true if unregistered
     */
    static unregisterFilter(fn, forRemove = false) {
        return GSDOMObserver.#isFunction(fn) ? GSDOMObserver.#getFilter(forRemove).delete(fn) : false;
    }

    /**
     * Static constructor with default body monitoring
     */
    static {
        Object.freeze(GSDOMObserver);
        globalThis.GSDOMObserver = GSDOMObserver;
        const observer = GSDOMObserver.create(document.documentElement);
        globalThis.addEventListener('unload', () => { observer.disconnect() });
    }

}


/*
GSDOMObserver.registerFilter((el)=>{ return el.tagName ==='DIV'}, (el) => {
    console.log(el);
});
*/
