/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSEvent class
 * @module base/GSEvent
 */

/**
 * Class extending native event with additional features
 * @Class
 */
export default class GSEvent extends EventTarget {

    #listeners = new Set();

    #list(type = '', listener) {
        const me = this;
        const list = Array.from(me.#listeners);
        return me.#isFunction(listener) ?
            list.filter(o => o.type === type && o.listener === listener)
            :
            list.filter(o => o.type === type);
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
        return this.addEventListener(type, listener);
    }

    /**
     * Listen for events only once
     * 
     * @param {string} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     */
    once(type, listener) {
        const me = this;
        const wrap = (e) => {
            listener(e);
            me.#listeners.delete(wrap);
        }
        wrap.type = type;
        wrap.listener = listener;
        return me.addEventListener(type, wrap, { once: true });
    }

    /**
     * Stop listening for events
     * 
     * @param {string} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     */
    off(type = '', listener) {
        this.removeEventListener(type, listener);
    }

    /**
     * Send event to listeners
     * 
     * @param {string} type Event name to be listened
     * @param {object} data  Data to send 
     */
    emit(type = '', data) {
        const evt = new CustomEvent(type, { detail: data });
        return this.dispatchEvent(evt);
    }

    /**
     * Wait for an event 
     * @param {string} type Event name to be listened
     * @returns {Event}
     */
    wait(type = '') {
        if (!type) return e('Event undefined!');
        const me = this;
        return new Promise((r, e) => {
            me.once(type, (e) => r(e));
        });
    }

    listen(type, listener) { this.on(type, listener); }
    unlisten(type, listener) { this.off(type, listener); }

    /**
     * Remove all listeners
     */
    unbind() {
        const me = this;
        Array.from(me.#listeners).forEach(o => {
            super.removeEventListener(o.type, o.listener);
        });
        me.#listeners.clear();
    }

    addEventListener(type, listener, opt) {
        const me = this;
        if (!me.#isFunction(listener)) return false;
        me.#listeners.add({ type: type, listener: listener });
        return super.addEventListener(type, listener, opt);
    }

    removeEventListener(type, listener) {
        const me = this;
        const list = me.#list(type, listener);
        list.forEach(o => super.removeEventListener(o.type, o.listener))
        list.forEach(o => me.#listeners.delete(o));
    }

    static {
        Object.freeze(GSEvent);
        globalThis.GSEvent = GSEvent;
    }
}