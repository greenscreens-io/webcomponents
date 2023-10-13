/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSFunction class
 * @module base/GSFunction
 */
import GSUtil from "./GSUtil.mjs";

/**
 * A set of static functions used for processing functions
 * @class
 */
export default class GSFunction {

    /**
     * Check if object is of type function
     * 
     * @param {function} fn 
     * @returns {boolean}
     */
    static isFunction = (fn) => typeof fn === 'function';

    static isFunctionNative(fn) {
        return GSFunction.isFunction(fn) && fn.toString().includes('native code');
    }

    /**
     * Check if object has function
     * 
     * @param {object} o 
     * @param {function} fn 
     * @returns {boolean}
     */
    static hasFunction(o, fn) {
        return o && GSFunction.isFunction(o[fn]);
    }

    /**
     * Check if object is of type async function
     * 
     * @param {function} fn 
     * @returns  {boolean}
     */
    static isFunctionAsync(fn) {
        if (!GSFunction.isFunction(fn)) return false;
        const AsyncFunction = GSFunction.callFunctionAsync.constructor
        let isValid = fn instanceof AsyncFunction;
        if (!isValid) isValid = fn[Symbol.toStringTag] == "AsyncFunction";
        return isValid;
    }

    /**
     * Generic asynchronous function caller
     * 
     * @async
     * @param {function} fn 
     * @param {object} owner 
     * @returns  {Promise}
     * @throws {Error} 
     */
    static async callFunctionAsync(fn, owner) {
        return owner ? await fn.bind(owner)() : await fn(owner);
    }

    /**
     * Generic synchronous function caller
     * 
     * @param {function} fn 
     * @param {object} owner 
     * @returns {object}
     * @throws {Error}
     */
    static callFunctionSync(fn, owner) {
        return owner ? fn.bind(owner)() : fn(owner);
    }

    /**
     * Generic function caller
     * 
     * @param {function} fn 
     * @param {object} owner 
     * @returns {object}
     */
    static async callFunction(fn, owner, native = true) {
        fn = GSUtil.isString(fn) ? GSFunction.parseFunction(fn) : fn;
        if (!GSFunction.isFunction(fn)) return;
        if (!native && GSFunction.isFunctionNative(fn)) return;
        if (GSFunction.isFunctionAsync(fn)) {
            return await GSFunction.callFunctionAsync(fn, owner);
        }
        return GSFunction.callFunctionSync(fn, owner);
    }

    /**
     * Convert string pointer to function call
     * 
     * @param {string} value 
     * @returns  {function}
     */
    static parseFunction(value) {
        const fn = GSUtil.parseValue(value);
        return GSFunction.isFunction(fn) ? fn : null;
    }

    static async #contextualize(fn, context, args) {
        if (!GSFunction.isFunction(fn)) return;
        const isAsync = GSFunction.isFunctionAsync(fn);
        if (isAsync) {
            return await fn.apply(context, args);
        } else {
            return fn.apply(context, args);
        }
    }

    /**
     * Wrap function into a single call - loop first call executed
     * @param {function} fn 
     * @param {*} context 
     * @returns 
     */
    static callOnceFifo(fn, context) {
        let cnt = false;
        return async (...args) => {
            if (cnt) return;
            cnt = true;
            const own = context || this;
            return await GSFunction.#contextualize(fn, own, args);
        }
    }

    /**
     * Wrap function into a single call - loop last call executed
     * @param {*} fn 
     * @param {*} ctx 
     * @returns 
     */
    static callOnceLifo(fn, context) {
        let cnt = 0;
        return (...args) => {
            if (cnt < 0) return;
            cnt++;
            const own = context || this;
            return new Promise((accept, reject) => {
                requestAnimationFrame(async () => {
                    if (cnt <= 0) return;
                    cnt--;
                    if (cnt !== 0) return;
                    try {
                        const o = await GSFunction.#contextualize(fn, own, args);
                        accept(o);
                    } catch (e) {
                        reject(e);
                    } finally {
                        cnt = -1;
                    }
                });
            });
        }
    }

    static {
        Object.seal(GSFunction);
        globalThis.GSFunction = GSFunction;
    }
}
