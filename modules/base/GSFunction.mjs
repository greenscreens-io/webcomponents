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
        return GSFunction.isFunction(fn) && fn.toString().indexOf('native code') > 0;
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
        try {
            return await fn(owner);
        } catch (e) {
            return e;
        }
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
        try {
            return fn(owner);
        } catch (e) {
            return e;
        }
    }

    /**
     * Generic function caller
     * 
     * @param {function} fn 
     * @param {object} owner 
     * @returns {object}
     */
    static callFunction(fn, owner, native = true) {
        if (!GSFunction.isFunction(fn)) return;
        if (!native && GSFunction.isFunctionNative(fn)) return;
        if (GSFunction.isFunctionAsync(fn)) {
            return GSFunction.callFunctionAsync(fn, owner);
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

    static {
        Object.seal(GSFunction);
    }
}
