/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSID } from "../base/GSID.mjs";
import { GSEvent } from "../base/GSEvent.mjs";
import { GSReadWriteRegistry } from "./ReadWriteRegistry.mjs";
import { DataSelector } from "./DataSelector.mjs";

/**
 * A module loading GSAbstractReadWrite class
 * @module base/GSEvent
 */

/**
 * Generic Class for data read/write for various components such as grid/form/dynamic menu etc.
 * @Class
 */
export class GSAbstractReadWrite extends GSEvent {

    static #SELECT = Symbol('select');

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
     * Store selected record ID
     * @param {*} val 
     * @returns 
     */
    addSelected(val) {
        if (!val) return false;
        DataSelector.addSelected(val);
        const me = this;
        me.emit('selection-add', val);
        me.emit('select');
        return val;
    }

    /**
     * Remove selected record ID
     * @param {*} val 
     */
    removeSelected(val) {
        if (!val) return false;
        DataSelector.removeSelected(val);
        const me = this;
        me.emit('selection-remove', val);
        me.emit('select');
        return val;
    }

    /**
     * Remove all selections
     */
    clearSelected(data) {
        DataSelector.clearSelected(data);
        const me = this;
        me.emit('selection-clear');
        me.emit('select');
    }

    /**
     * Return list of all selected record id's
     */
    getSelected(data = []) {
        return DataSelector.getSelected(data);
    }

    /**
     * Check if record id is in list of selected records
     * @param {*} val 
     * @returns 
     */
    isSelected(val) {
        return DataSelector.isSelected(val);
    }

    /**
     * Get list of selected records.
     * Override in inherited class
     */
    get selected() {
        return [];
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

    /**
     * Reset the abstract read/write handler
     */
    reset() {
        this.#processors = null;
    }

}