/*
 * Copyright (C) 2015, 2023 Green Screens Ltd.
 */


import GSEvent from "./GSEvent.mjs";
import GSID from "./GSID.mjs";
import GSReadWriteRegistry from "./GSReadWriteRegistry.mjs";

/**
 * A module loading GSAbstractReadWrite class
 * @module base/GSEvent
 */

/**
 * Generic Class for data read/write for various components such as grid/form/dynaimc menu etc.
 * @Class
 */
export default class GSAbstractReadWrite extends GSEvent {

    #id = null;

    constructor(name, enabled = true) {
        super();
        const me = this;
        me.#id = name || GSID.next();
        if (enabled) me.enable();
    }

    get id() {
        return this.#id;
    }

    enable() {
        const me = this;
        GSReadWriteRegistry.register(me);
        me.emit('enabled');
    }

    disable() {
        const me = this;
        GSReadWriteRegistry.unregister(me);
        me.emit('disabled');
    }

    get isRegistered() {
        return GSReadWriteRegistry.find(this.id) ? true : false;
    }

    async read(owner) {
        const me = this;
        let data = null;
        try {
            data = await me.onRead(owner);
            me.emit('read', {owner : owner, data: data});
        } catch (e) {
            me.emit('error', {type : 'read', error: e, owner : owner, data: data});
            throw e;
        }
        return data;
    }

    async write(owner, data) {
        const me = this;
        let result = null;
        try {
            result = await me.onWrite(owner, data);
            me.emit('write', {owner : owner, data: data, result : result});
        } catch (e) {
            me.emit('error', {type : 'write', error: e, owner : owner, data: data});
            throw e;
        }
        return result;
    }

    /**
     * Override in inherited class
     * @param {} owner 
     * @returns 
     */
    async onRead(owner) {
        throw new Error('Extend base GSAbstractReadWrite to implement read operation');
    }

    /**
     * Override in inherited class
     * @param {} owner 
     * @param {} data
     * @returns 
     */    
    async onWrite(owner, data) {
        throw new Error('Extend base GSAbstractReadWrite to implement write operation');
    }

}