/*
 * Copyright (C) 2015, 2027 Green Screens Ltd.
 */

import GSPromise from "./GSPromise.mjs";
import GSUtil from "./GSUtil.mjs";

/**
 * A module loading GSEvent class
 * @module base/GSEvent
 */

/**
 * Class extending native event with additional features
 * @Class
 */
export default class GSEvent extends EventTarget {

    #listeners = new Map();

    #list(type = '', listener) {
        const me = this;
        const map = me.#listeners.get(type) || new Map();
        const list = Array.from(map.values());
        return me.#isFunction(listener) ?
            list.filter(o => o.listener === listener)
            :
            list;
    }

    #isFunction(fn) {
        return typeof fn === 'function';
    }

    /**
     * Listen for events
     * 
     * @param {string} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     * @param {Number} timeout It event timeout set, return AbortSignal
     * @param {boolean|AbortController} abortable If abortable set, return AbortController
     */
    on(type = '', listener, timeout = 0, abortable = false) {
        if (!type) throw new Error('Event undefined!');
        let controller = null;
        if (abortable instanceof AbortController) {
            controller = abortable;
        } else {
            controller = abortable ? new GSAbortController(timeout) : null;
        }
        const signal = controller || timeout == 0 ? controller?.signal : AbortSignal.timeout(timeout); 
        this.addEventListener(type, listener,  { signal:signal });
        return controller || signal;
    }

    /**
     * Listen for events only once
     * 
     * @param {string} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     * @param {Number} timeout It event timeout set, return AbortSignal
     * @param {boolean|AbortController} abortable If abortable set, return AbortController
     */
    once(type, listener, timeout = 0, abortable = false) {
        if (!type) throw new Error('Event undefined!');
        const me = this;
        const wrap = (e) => {
            try {
                listener(e);
            } finally {
                me.removeEventListener(type, wrap);
            }
        }
        wrap.type = type;
        wrap.listener = listener;
        wrap.timeout = timeout;
        if (abortable instanceof AbortController) {
            wrap.controller = abortable;
        } else {
            wrap.controller = abortable ? new GSAbortController(timeout) : null;
        }
        wrap.signal = wrap.controller ? wrap.controller.signal : (timeout === 0 ? undefined : AbortSignal.timeout(timeout)); 
        me.addEventListener(type, wrap, { once: true, signal: wrap.signal });
        return wrap.controller || wrap.signal;
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
     * @param {number} delayed Emit event delay in miliseconds
     */
    emit(type = '', data, delayed = 0) {
        const me = this;
        delayed = GSUtil.asNum(delayed, 0);
        if (delayed <= 0) return me.#send(type, data);
        return setTimeout(() => me.#send(type, data), delayed);
    }

    #send(type = '', data) {     
        const evt = new CustomEvent(type, { detail: data });
        return this.dispatchEvent(evt);
    }

    /**
     * Wait for an event using GSPromise wrapper
     * @param {string} type Event name to be listened
     * @param {AbortSignal} signal Used to abort listener
     * @returns {Event}
    */
   wait(type = '', signal) {
       const me = this;
       const callback = (resolve, reject) => {
           me.once(type, resolve);
        }
        return new GSPromise(callback, signal).await();
    }    

    listen(type, listener) { this.on(type, listener); }
    unlisten(type, listener) { this.off(type, listener); }

    /**
     * Remove all listeners
     */
    unbind() {
        const me = this;
        for (const [type, listeners] of me.#listeners.entries()) {
            for (const entry of listeners.values()) {
                super.removeEventListener(type, entry.listener);
            }
        }
        me.#listeners.clear();
    }

    addEventListener(type, listener, opt) {
        const me = this;
        if (!me.#isFunction(listener)) return false;
        const listeners = me.#listeners.get(type) || new Map();
        listeners.set(listener, { type: type, listener: listener, opt: opt });
        me.#listeners.set(type, listeners);
        return super.addEventListener(type, listener, opt);
    }

    removeEventListener(type, listener) {
        const me = this;
        const list = me.#list(type, listener);
        if (!list.length) return;
        const listeners = me.#listeners.get(type);
        if (!listeners) return;
        list.forEach(o => {
            super.removeEventListener(o.type, o.listener);
            listeners.delete(o.listener);
        });
        if (listeners.size === 0) me.#listeners.delete(type);
    }

    static {
        Object.freeze(GSEvent);
        globalThis.GSEvent = GSEvent;
    }
}