/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSData } from "../base/GSData.mjs";
import { GSReadWrite } from "./ReadWrite.mjs";
import { GSReadWriteRegistry } from "./ReadWriteRegistry.mjs";

/**
 * A module loading GSCachedReadWrite class
 * @module base/GSCachedReadWrite
 */

/**
 * ReadWrite with cached memory data. 
 * @Class
 */
export class GSCachedReadWrite extends GSReadWrite {

    static #TYPE = 'cached';

    #data = [];

    #reformat(data = []) {

        let records = [];
        if (Array.isArray(data)) {
            records = data;
        } else if (Array.isArray(data.data)) {
            records = data.data;
        } else {
            records = [data];
        }

        return records;
    }

    #postFilter(data) {
        const me = this;
        data = GSData.sortData(data, me.sort);        
        let limit = me.limit === 0 ? data.length : me.limit;
        data = data.slice(me.skip, me.skip + limit);
        return data;
    }

    clear() {
        this.clearSelected(this.#data);
        this.#data = [];
    }

    append(data) {
        if(!data) return false;
        const me = this;
        data = me.#reformat(data);
        me.#data = me.#data.concat(data);
        return me.#data;
    }

    remove(data) {
        const me = this;
        me.removeSelected(data);
        me.#data = me.#data.filter(o => o =! data);
        return me.#data;
    }

    /**
     * Override in inherited class
     * @param {} owner Calling HTMLElement
     * @returns {Array<Object>} Json Array data loaded 
     */
    async onRead(owner) {
        const me = this;

        if (me.#data.length === 0) {
            const data = await super.onRead();
            me.#data = me.#reformat(data);
        }

        let data = GSData.filterData(me.#data, me.filter, me.fields, me.limit);
        data = me.#postFilter(data);
        return data;
    }

    async onWrite(owner, data) {
        return this.append(data);        
    }

    disable() {
        this.#data = [];
        super.disable();
    }

    set search(val) {
        const me = this;
        me.filter = val ? [{value : val}] : [];
        me.read();
        /*
        let data = GSData.filterData(me.#data, [{value : val}]);
        data = me.#postFilter(data);
        me.notify(me, 'read', data);
        */
    }

    clearSelected() {
        return super.clearSelected(this.#data);
    }

    /**
     * Return list of all selected record id's
     */
    get selected() {
        return super.getSelected(this.#data);
    }

    /**
     * Handler type
     */
    get type() {
        return GSCachedReadWrite.#TYPE;
    }

    /**
     * Reset the cached read/write handler
     */
    reset() {
        this.clear();
        super.reset();
    }

    /**
     * Register generic handler under unique name.
     * @param {string} name Unique handler name
     * @returns {GSReadWrite} Data handler instance
     */
    static register(name) {
        return new GSCachedReadWrite(name, true);
    }

    static {
        GSReadWriteRegistry.addHandler(GSCachedReadWrite.#TYPE, GSCachedReadWrite);
    }

}