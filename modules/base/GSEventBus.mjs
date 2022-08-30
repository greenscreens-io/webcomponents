/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSEventBus class
 * @module base/GSEventBus
 */


/**
 * Class for handling shared events among components
 * @Class
 */
export default class GSEventBus extends EventTarget {

    static #registry = new Map();

    #listeners = new Set();

    /**
     * Check if named event bus already exists
     * 
     * @param {string} name 
     * @returns {boolean}
     */
    static exist(name = '') {
        return name && GSEventBus.#registry.has(name);
    }

    /**
     * Register a named event bus. If already exists, will return existsing instance.
     * @param {string} name unique bus name
     * @returns {GSEventBus}
     */
    static register(name = '') {
        if (!GSEventBus.exist(name)) {
            GSEventBus.#registry.set(name, new GSEventBus());
        }
        return GSEventBus.#registry.get(name);
    }

    /**
     * Unregister named event bus from registry.
     * @param {string} name unique buss name
     * @returns {boolean} State of removal.
     */
    static unregister(name = '') {
        const bus = GSEventBus.#registry.get(name);
        if (bus) bus.#unbind();
        return GSEventBus.#registry.delete(name);
    }

    #unbind() {
        const me = this;
        Array.from(me.#listeners).forEach(o => {
            me.removeEventListener(o.type, o.listener);
        });
        me.#listeners.clear();
    }

    #isFunction(fn) {
        return typeof fn === 'function';
    }

    /**
     * Listen for events
     * 
     * @param {string} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     */
    on(type = '', listener) {
        const me = this;
        if (!me.#isFunction(listener)) return;
        me.#listeners.add({type:type, listener : listener});
        me.addEventListener(type, listener);
    }

    /**
     * Listen for events only once
     * 
     * @param {string} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     */    
    once(type, listener) {
        const me = this;
        if (!me.#isFunction(listener)) return;
        const wrap = (e) => {
            listener(e);
            me.#listeners.delete(wrap);
        }
        wrap.type = type;
        wrap.listener = listener;
        me.#listeners.add(wrap);
        this.addEventListener(type, wrap, { once: true });
    }

    /**
     * Stop listening for events
     * 
     * @param {string} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     */    
    off(type = '', listener) {
        const me = this;
        if (!me.#isFunction(listener)) return;
        me.removeEventListener(type, listener);
        Array.from(me.#listeners)
            .filter(o => o.type === type && o.listener === listener)
            .forEach(o => me.#listeners.delete(o));
    }

    /**
     * Send event to listeners
     * 
     * @param {string} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     */        
    emit(type = '', data) {
        const evt = new CustomEvent(type, { detail: data });
        this.dispatchEvent(evt);
    }

}