/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSData } from "../base/GSData.mjs";
import { GSReadWrite } from "./ReadWrite.mjs";
import { GSReadWriteRegistry } from "./ReadWriteRegistry.mjs";

/**
 * A module loading GSReadWrite class
 * @module base/GSEvent
 */

/**
 * ReadWrite with cached memory data. 
 * @Class
 */
export class GSCachedReader extends GSReadWrite {

    #data = [];

    #reformat(data = []) {

        const me = this;

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
        this.#data = [];
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

    /**
     * Register generic handler under unique name.
     * @param {string} name Unique handler name
     * @returns {GSReadWrite} Data handler instance
     */
    static register(name) {
        return new GSCachedReader(name, true);
    }

    static {
        GSReadWriteRegistry.addHandler('cached', GSCachedReader);
    }

}