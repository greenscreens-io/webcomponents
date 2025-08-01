/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSFunction class
 * @module base/GSFunction
 */
import { GSUtil } from "./GSUtil.mjs";

/**
 * A set of static functions used for processing functions
 * @class
 */
export class GSFunction {

    /**
     * Check if object is of type function
     * 
     * @param {function} fn 
     * @returns {Boolean}
     */
    static isFunction = (fn) => typeof fn === 'function';

    static isFunctionNative(fn) {
        return GSFunction.isFunction(fn) && fn.toString().includes('native code');
    }

    /**
     * Check if object has function
     * 
     * @param {Object} o 
     * @param {function} fn 
     * @returns {Boolean}
     */
    static hasFunction(o, fn) {
        return o && GSFunction.isFunction(o[fn]);
    }

    /**
     * Check if class has defined getter
     * @param {*} own 
     * @param {*} name 
     * @returns 
     */
    static hasGetter(own, name) {
        return GSFunction.isFunctionDefined(own, name, 'get');
    }

    /**
     * * Check if class has defined setter
     * @param {*} own 
     * @param {*} name 
     * @returns 
     */
    static hasSetter(own, name) {
        return GSFunction.isFunctionDefined(own, name, 'set');
    }

    /**
     * Check if class instance has defined function
     * @param {object} own Class instance
     * @param {string} name Function name to check
     * @param {string} fn Function name to check
     * @returns {boolean} Returns true if getter exist
     */
    static isFunctionDefined(own, name, fn) {
        const desc = own ? Reflect.getOwnPropertyDescriptor(own.__proto__, name) : false;
        return desc && typeof desc[fn] === 'function';
    }

    /**
     * Check if object is of type async function
     * 
     * @param {function} fn 
     * @returns  {Boolean}
     */
    static isFunctionAsync(fn) {
        if (!GSFunction.isFunction(fn)) return false;
        const AsyncFunction = GSFunction.callFunctionAsync.constructor
        let isValid = fn instanceof AsyncFunction;
        if (!isValid) isValid = fn[Symbol.toStringTag] == "AsyncFunction";
        return isValid;
    }

    /**
     * Check if object is of type generator function
     * 
     * @param {function} fn 
     * @returns {Boolean}
     */
    static isFunctionGenerator(fn) {
        if (!GSFunction.isFunction(fn)) return false;
        const GeneratorFunction = (function* () { }).constructor;
        return fn instanceof GeneratorFunction;
    }

    /**
     * Generic asynchronous function caller
     * 
     * @async
     * @param {function} fn 
     * @param {Object} owner 
     * @returns  {Promise}
     * @throws {Error} 
     */
    static async callFunctionAsync(fn, owner) {
        const args = arguments ? Array.from(arguments).slice(2) : [];
        return await fn.apply(owner || null, args);
    }

    /**
     * Generic synchronous function caller
     * 
     * @param {function} fn 
     * @param {Object} owner 
     * @returns {Object}
     * @throws {Error}
     */
    static callFunctionSync(fn, owner) {
        const args = arguments ? Array.from(arguments).slice(2) : [];
        return fn.apply(owner || null, args);
    }

    /**
     * Generic function caller
     * 
     * @param {function} fn 
     * @param {Object} owner 
     * @returns {Object}
     */
    static async callFunction(fn, owner, native = true) {
        fn = GSUtil.isString(fn) ? GSFunction.parseFunction(fn) : fn;
        if (!GSFunction.isFunction(fn)) return;
        if (!native && GSFunction.isFunctionNative(fn)) return;
        const args = arguments ? Array.from(arguments).slice(3) : [];
        if (GSFunction.isFunctionAsync(fn)) {
            return await GSFunction.callFunctionAsync(fn, owner, ...args);
        }
        return GSFunction.callFunctionSync(fn, owner, ...args);
    }

    /**
     * Convert string pointer to function call
     * 
     * @param {String} value 
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
     * @param {function} fn Function to be called
     * @param {*} context Instance at which to call the function
     * @returns {*} Function result
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
     * @param {function} fn Function to be called
     * @param {*} context Instance at which to call the function
     * @returns {*} Function result
     */
    static callOnceLifo(fn, context) {
        let cnt = 0;
        return (...args) => {
            if (cnt < 0) return;
            cnt++;
            const own = context || this;
            return new Promise((accept, reject) => {
                queueMicrotask(async () => {
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

    /**
     * Debounce function makes sure that code is only triggered once per user input. 
     * Search box suggestions, text-field auto-saves, and eliminating double-button clicks are all use cases for debounce.
     * @param {Function} func 
     * @param {Number} timeout 
     * @returns {Function}
     */
    static debounce(func, timeout = 300, leading = false) {
        return leading ? GSFunction.#debounceLifo(func, timeout) : GSFunction.#debounceFifo(func, timeout);
    }

    /**
     * Call only last function call within timeout period.
     * @param {Function} func 
     * @param {Number} timeout 
     * @returns {Function}
     */
    static #debounceLifo(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    /**
     * Call only first function call within timeout period.
     * @param {*} func 
     * @param {*} timeout 
     * @returns 
     */
    static #debounceFifo(func, timeout = 300) {
        let timer;
        return (...args) => {
            if (!timer) {
                func.apply(this, args);
            }
            clearTimeout(timer);
            timer = setTimeout(() => {
                timer = undefined;
            }, timeout);
        };
    }

    static {
        Object.seal(GSFunction);
        globalThis.GSFunction = GSFunction;
    }
}
