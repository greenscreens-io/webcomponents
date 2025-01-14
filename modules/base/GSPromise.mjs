/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { GSUtil } from "./GSUtil.mjs";

/**
 * A module loading GSPromise class
 * @module base/GSPromise
 */

/**
 * A Promise wrapper for timeouted and cancelable events
 * @class
 */
export class GSPromise {

    #signal;
    #callback;
    #callbacks;
    #resolve;
    #reject;
    #promise;

    /**
     * 
     * @param {*} callback 
     * @param {Number|AbortSignal} signal Timeout or custom signal
     */
    constructor(callback, signal) {
        const me = this;
        me.#callback = callback;
        me.#signal = signal instanceof AbortSignal ? signal : null;
        me.#signal = GSUtil.isNumber(signal) ? AbortSignal.timeout(signal) : me.#signal;
        me.#callbacks = {
            abort: me.#onAbort.bind(me)
        };
    }

    await() {
        const me = this;
        if (me.#promise) return me.#promise;
        me.#signal?.addEventListener('abort', me.#callbacks.abort);
        me.#promise = new Promise(me.#wrap.bind(me));
        return me.#promise;
    }

    get aborted() {
        return this.#signal?.aborted === true;
    }

    #wrap(resolve, reject) {
        const me = this;
        me.#resolve = resolve;
        me.#reject = reject;
        try {
            me.#callback(me.#onResolve.bind(me), me.#onReject.bind(me));
        } catch (e) {
            me.#clear();
            reject(e);
        }
    }

    #onAbort() {
        const me = this;
        me.#clear();
        me.#reject(new Error('Promise aborted!'));
    }

    #onResolve(o) {
        const me = this;
        me.#clear();
        return me.aborted ? null : me.#resolve(o);
    }

    #onReject(e) {
        const me = this;
        me.#clear();
        return me.aborted ? null : me.#reject(e);
    }

    #clear() {
        const me = this;
        me.#signal?.removeEventListener('abort', me.#callbacks.abort);
    }

	/**
	 * Execute array of promisses sequentially
	 * @param {Arrayy<Promise>} ps 
	 * @returns 
	 */
	static sequential(ps) {
		if (!Array.isArray(ps)) ps = [];
		return ps.reduce((p, next) => p.then(next), Promise.resolve());
	}

    static {
        globalThis.GSPromise = GSPromise;
    }
}