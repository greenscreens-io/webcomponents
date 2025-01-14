/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSID } from "../base/GSID.mjs";
import { GSEvent } from "../base/GSEvent.mjs";
import { GSReadWriteRegistry } from "./ReadWriteRegistry.mjs";

/**
 * A module loading GSAbstractReadWrite class
 * @module base/GSEvent
 */

/**
 * Generic Class for data read/write for various components such as grid/form/dynaimc menu etc.
 * @Class
 */
export class GSAbstractReadWrite extends GSEvent {

    #id = null;
    #processors = null;

    constructor(name, enabled = true) {
        super();
        const me = this;
        me.#id = name || GSID.next();
        if (enabled) me.enable();
    }

    /**
     * Data preprocessor to register
     * @param {object} processor
     */
    addProcessor(processor) {
        if (!processor) return;
        this.#processors ??= new Set();
        this.#processors.add(processor);
    }

    /**
     * Data preprocessor to remove
     * @param {object} processor 
     */    
    removeProcessor(processor) {
        if (processor) this.#processors?.delete(processor);
    }

    /**
     * Unique data handler name
     * @returns {string} 
     */
    get id() {
        return this.#id;
    }

    /**
     * Register into global data handler registry
     */
    enable() {
        const me = this;
        GSReadWriteRegistry.register(me);
        me.emit('enabled');
    }

    /**
     * Unregister from global data handler registry
     */
    disable() {
        const me = this;
        GSReadWriteRegistry.unregister(me);
        me.emit('disabled');
    }

    /**
     * Check if data handler is registered in global registry
     * @returns {boolean}
     */
    get isRegistered() {
        return GSReadWriteRegistry.find(this.id) ? true : false;
    }

    /**
     * Generic event dispatcher, can be overriden to controll when to fire event
     * @param {*} owner 
     * @param {*} type 
     * @param {*} data 
     * @param {*} error 
     */
    notify(owner, type, data, error) {
        this.emit(error ? 'error' : type, { type: type, error: error, owner: owner, data: data }, true);
    }

    /**
     * Initiate data read from remote
     * @param {HTMLElement} owner 
     * @returns {Array|Object} JSON data response
     */
    async read(owner) {
        const me = this;
        let data = null;
        try {
            data = await me.onRead(owner);
            me.#processors?.forEach(c => c.postRead?.(data));
            if (data) me.notify(owner, 'read', data);
        } catch (e) {
            me.notify(owner, 'read', data, e);
            throw e;
        }
        return data;
    }

    /**
     * Initiate data write to remote
     * @param {HTMLElement} owner 
     * @returns {Array|Object} JSON data response
     */
    async write(owner, data) {
        const me = this;
        let result = null;
        try {
            result = await me.onWrite(owner, data);
            me.#processors?.forEach(c => c.postWrite?.(data));
            if (result) me.notify(owner, 'write', data);
        } catch (e) {
            me.notify(owner, 'write', data, e);
            throw e;
        }
        return result;
    }

    /**
     * Override in inherited class to implement read logic
     * @param {} owner 
     * @returns 
     */
    async onRead(owner) {
        throw new Error('Extend base GSAbstractReadWrite to implement read operation');
    }

    /**
     * Override in inherited class to implement write logic
     * @param {} owner 
     * @param {} data
     * @returns 
     */
    async onWrite(owner, data) {
        throw new Error('Extend base GSAbstractReadWrite to implement write operation');
    }

}