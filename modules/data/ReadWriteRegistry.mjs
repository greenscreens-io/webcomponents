/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSEvent } from "../base/GSEvent.mjs";
import { GSUtil } from "../base/GSUtil.mjs";

/**
 * A module loading GSReadWriteRegistry class
 * @module base/GSEvent
 */

/**
 * Global registry for GSAbstractReadWrite instances - data read/write 
 * @Class
 */
class GSReadWriteRegistryImpl extends GSEvent {

    static #instance = null;
    static #INTERNAL = Symbol();

    #handlers = new Map();

    #map = new Map();

    constructor(key) {
        if (key != GSReadWriteRegistryImpl.#INTERNAL) throw new Error('Creating new instance not allowed.');
        super();
    }

    /**
     * Register data handler
     * @param {string} type unique handler name
     * @param {GSReadWriteRegistry} clazz 
     */
    addHandler(type, clazz) {        
        this.#handlers.set(type, clazz);
    }

    /**
     * Unregister data handler
     * @param {string} type unique handler name
     */
    removeHandler(type) {        
        this.#handlers.delete(type);
    }

    /**
     * Get registered handler by name
     * @param {string} type unique handler name
     */    
    getHandler(type) {
        return this.#handlers.get(type);
    }

    /**
     * Initialize data handler instance
     * @param {string} type unique handler name
     * @param {string} name unique instance name
     * @param {GSReadWriteRegistry} clazz 
     */    
    newHandler(type, name, enabled) {
        const clazz = this.getHandler(type);
        return clazz ? new clazz(name, enabled) : undefined;
    }

    /**
     * Register GSAbstractReadWrite instance or inherited classes
     * @param {GSAbstractReadWrite} obj 
     */
    register(obj) {
        const me = this;
        me.#verify(obj);
        const cache = me.find(obj.id);
        if (cache == obj) return;
        if (cache) throw new Error(`Key (${obj.id}) already exist in read/write registry!`);
        me.#map.set(obj.id, obj);
        me.emit(`register-${obj.id}`, obj);
        me.emit(`register`, obj);
    }

    /**
     * Unregister GSAbstractReadWrite instance or inherited classes
     * @param {GSAbstractReadWrite} obj 
     * @returns {boolean} Deletion status
     */
    unregister(obj) {
        const me = this;
        if (GSUtil.isString(obj)) obj = me.find(obj);
        me.#verify(obj);
        const sts = me.#map.delete(obj.id);
        if (sts) {
            me.emit(`unregister-${obj.id}`, obj);
            me.emit(`unregister`, obj);
        }
        return sts;
    }

    /**
     * Find registered handler
     * @param {string} val 
     * @returns 
     */
    find(val) {
        return this.#map.get(val);
    }

    /**
     * Wait for specific habdler to be either registered or unregistered
     * @param {string} id 
     * @param {number|AbortSignal} signal Cancelation in timeout or provided signal
     * @param {boolean} register Listen for register or unregister
     * @returns 
     */
    async wait(id = '', signal, register = true) {
        if (!id) throw new Error('GSReadWrite ID not valid.');
        const me = this;
        if (register) {
            const rw = me.find(id);
            if (rw) return rw;
        }
        const type = register ? 'register' : 'unregister';
        await super.wait(`${type}-${id}`, signal);
        return me.find(id);
    }

    /**
     * Reset the registry
     */
    resetRegistry() {
        this.#handlers.clear();
        this.#map.clear();
    }

    #verify(obj) {
        //if (!(obj instanceof GSAbstractReadWrite)) throw new Error('Invalid parameter type.');
    }

    static get #self() {
        if (!GSReadWriteRegistryImpl.#instance) GSReadWriteRegistryImpl.#instance = new GSReadWriteRegistryImpl(GSReadWriteRegistryImpl.#INTERNAL);
        return GSReadWriteRegistryImpl.#instance;
    }

    static {
        Object.seal(GSReadWriteRegistryImpl);
        globalThis.GSReadWriteRegistry = GSReadWriteRegistryImpl.#self;
    }

}

export const GSReadWriteRegistry = globalThis.GSReadWriteRegistry;

