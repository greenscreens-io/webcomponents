/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSPromise } from "./GSPromise.mjs";
import { GSUtil } from "./GSUtil.mjs";

/**
 * A module loading GSEvent class
 * @module base/GSEvent
 */

/**
 * Class extending native event with additional features
 * @Class
 */
export class GSEvent extends EventTarget {

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
     * @param {String} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     * @param {Number} timeout It event timeout set, return AbortSignal
     * @param {boolean|AbortController} abortable If abortable set, return AbortController
     */
    on(type = '', listener, timeout = 0, abortable = false) {
        if (!type) return reject('Event undefined!');
        let controller = null;
        if (abortable instanceof AbortController) {
            controller = abortable;
        } else {
            controller = abortable ? new GSAbortController(timeout) : null;
        }
        const signal = controller || timeout == 0 ? controller?.signal : AbortSignal.timeout(timeout);
        this.addEventListener(type, listener, { signal: signal });
        return controller || signal;
    }

    /**
     * Listen for events only once
     * 
     * @param {String} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     * @param {Number} timeout It event timeout set, return AbortSignal
     * @param {boolean|AbortController} abortable If abortable set, return AbortController
     */
    once(type, listener, timeout = 0, abortable = false) {
        if (!type) return reject('Event undefined!');
        const me = this;
        const wrap = (e) => {
            listener(e);
            me.#listeners.delete(wrap);
        }
        wrap.type = type;
        wrap.listener = listener;
        wrap.timeout = timeout;
        if (abortable instanceof AbortController) {
            wrap.controller = abortable;
        } else {
            wrap.controller = abortable ? new GSAbortController(timeout) : null;
        }
        wrap.signal = wrap.controller || timeout == 0 ? wrap.controller?.signal : AbortSignal.timeout(timeout);
        me.addEventListener(type, wrap, { once: true, signal: wrap.signal });
        return wrap.controller || wrap.signal;
    }

    /**
     * Stop listening for events
     * 
     * @param {String} type Event name to be listened
     * @param {Function} listener  Callback to be called on event trigger
     */
    off(type = '', listener) {
        this.removeEventListener(type, listener);
    }

    /**
     * Send event to listeners
     * 
     * @param {String} type Event name to be listened
     * @param {Object} data  Data to send 
     * @param {Number} delayed Emit event delay in miliseconds
     */
    emit(type = '', data, delayed = 0) {
        const me = this;
        if (delayed === true) {
            return queueMicrotask(() => me.#send(type, data));
        }
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
     * @param {String} type Event name to be listened
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