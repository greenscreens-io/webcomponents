/*
 * Copyright (C) 2015, 2023 Green Screens Ltd.
 */

import GSUtil from "./GSUtil.mjs";

/**
 * A module loading GSReadWriteRegistry class
 * @module base/GSEvent
 */

/**
 * Generic Class for data read/write global registry
 * @Class
 */
class GSReadWriteRegistryImpl extends GSEvent {

    static #instance = null;
    static #INTERNAL = Symbol();
    #map = new Map();

    constructor(key) {
        if (key != GSReadWriteRegistryImpl.#INTERNAL) throw new Error('Creating new instance not allowed.');
        super();
    }

    register(obj) {
        const me = this;
        me.#verify(obj);
        if (me.#map.has(obj.id)) throw new Error('Key already exist in read/write registry!');
        me.#map.set(obj.id, obj);
        me.emit(`register-${obj.id}`, obj);
        me.emit(`register`, obj);
    }

    unregister(obj) {
        const me = this;
        if (GSUtil.isString(obj)) obj = me.find(obj);
        me.#verify(obj);
        me.#map.delete(obj.id);
        me.emit(`unregister-${obj.id}`, obj);
        me.emit(`unregister`, obj);
    }

    find(name) {
        return this.#map.get(name);
    }

    /**
     * 
     * @param {string} id 
     * @param {number|AbortSignal} signal Cancelation in timouet or provided signal
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

 const GSReadWriteRegistry = globalThis.GSReadWriteRegistry;
 export default GSReadWriteRegistry;
