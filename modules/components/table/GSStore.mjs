/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSStore class
 * @module components/table/GSStore
 */

import GSUtil from "../../base/GSUtil.mjs";
import GSEvents from "../../base/GSEvents.mjs";
import GSData from "../../base/GSData.mjs";
import GSItem from "../../base/GSItem.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSDataHandler from "../GSDataHandler.mjs";
import GSAttr from "../../base/GSAttr.mjs";

/**
 * Table data handler, pager, loader
 * @class
 * @extends {HTMLElement}
 */
export default class GSStore extends GSDataHandler {

    #filter = [];
    #sort = [];
    #data = [];
    #page = 1;
    #total = 0;

    static {
        customElements.define('gs-store', GSStore);
        Object.seal(GSStore);
    }

    static get observedAttributes() {
        const attrs = ['cached'];
        return GSDataHandler.observeAttributes(attrs);
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    disconnectedCallback() {
        const me = this;
        me.#data = [];
        me.#filter = [];
        me.#sort = [];
        super.disconnectedCallback();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === 'cached') {
            const me = this;
            if (!me.cached) {
                me.clear();
                me.disabled = false;
            }
        }
    }

    /**
     * Get GS-ITEM field definition by name
     * @param {String} name 
     * @returns 
     */
    getField(name = '') {
        return this.querySelector(`gs-item[name="${name}"]`);
    }

    get table() {
        return GSDOM.closest(this, 'GS-TABLE')
    }

    get localSort() {
        return this.hasAttribute('local-sort');
    }

    get localFilter() {
        return this.hasAttribute('local-filter');
    }

    /**
     * if true, on every request data is loded from remote
     * if false, data is loaded once and cached
     */
    get cached() {
        return this.hasAttribute('cached');
    }

    set cached(val = false) {
        return GSAttr.toggle(this, 'cached', GSUtil.asBool(val));
    }

    get isCached() {
        const me = this;
        return Array.isArray(me.#data) && me.#data.length > 0;
    }

    /**
     * Currently loaded data
     */
    get data() {
        return this.#data;
    }

    get total() {
        return this.#total || this.#data.length;
    }

    /**
     * PAGINATION SEGMENT 
     */

    get offset() {
        const me = this;
        return (me.page - 1) * me.limit;
    }

    get page() {
        return this.#page;
    }

    set page(val = 1) {
        const me = this;
        val = GSUtil.asNum(val, 1);
        val = Math.min(Math.max(val, 1), Number.MAX_VALUE);
        val = val > me.pages ? me.pages : val;
        me.#page = val;
        const skip = me.limit * (val - 1);
        me.#getData(skip, me.limit, me.filter, me.sort);
    }

    /**
     * Total pages
     */
    get pages() {
        const me = this;
        if (me.total === 0) return 1;
        return me.limit === 0 ? 1 : Math.ceil(me.total / me.limit);
    }

    nextPage() {
        const me = this;
        if (me.page === me.pages) return;
        me.page = me.page + 1;
        return me.#page;
    }

    prevPage() {
        const me = this;
        if (me.page === 1) return;
        me.page = me.page - 1;
        return me.#page;
    }

    lastPage() {
        const me = this;
        me.page = me.limit === 0 ? 1 : me.pages;
        return me.#page;
    }

    firstPage() {
        const me = this;
        me.page = 1;
        return me.page;
    }

    /**
     * Filter data in format 
     * [{name: idx[num] || name[string], value: ''  , op:'eq'}]
     */
    get filter() {
        const me = this;
        return me.localFilter || (me.#isLocal && me.disabled) ? me.#filter : super.filter;
    }

    set filter(val) {
        const me = this;
        val = me.#formatFilter(val);
        if (me.localFilter || (me.#isLocal && me.disabled)) {
            me.#filter = val;
            // me.read();
        } else {
            super.filter = val;
        }
    }

    get sort() {
        const me = this;
        return me.localSort || (me.#isLocal && me.disabled) ? me.#sort : super.sort;
    }

    /**
     * Sort data in format
     * [{col: idx[num] || name[string]  , op: -1 | 1 }]
     */
    set sort(val) {
        const me = this;
        val = me.#formatSort(val);
        if (me.localSort || (me.#isLocal && me.disabled)) {
            me.#sort = val;
            // me.read();
        } else {
            super.sort = val;
        }
    }

    /*
     * INTERNAL SEGMENT
     */

    /**
     * Clear cache and reload from remote
     */
    clear() {
        const me = this;
        me.#total = 0;
        me.setData();
    }

    /**
     * Manual data set, 
     * @param {*} data 
     * @param {*} append 
     * @returns 
     */
    setData(data = [], append = false) {
        const me = this;
        me.#update(data, append);
        return me.read();
    }

    /**
     * Read from remote with optional caching support and local sort/filter
     * @param {*} clear 
     * @returns 
     */
    read(clear = false) {
        const me = this;
        if (clear) me.#data = [];
        return me.#getData(me.skip, me.limit, me.filter, me.sort);
    }

    async #getData(skip = 0, limit = 0, filter, sort) {
        const me = this;
        let data = [];

        if (me.#isLocal || me.disabled) {
            data = me.#getDataLocal(skip, limit, filter, sort, me.#data);
            me.#notify('data', data);
        } else {
            data = await super.read();
        }

        return data;
    }

    #getDataLocal(skip = 0, limit = 0, filter, sort, data) {
        const me = this;
        data = GSData.filterData(filter, data, me.#fields);
        data = GSData.sortData(sort, data);
        limit = limit === 0 ? data.length : limit;
        data = data.slice(skip, skip + limit);
        return data;
    }

    get #isLocal() {
        const me = this;
        return (me.isCached && me.cached);
    }

    #update(data = [], append = false) {

        const me = this;

        let records = [];
        if (Array.isArray(data)) {
            records = data;
        } else if (Array.isArray(data.data)) {
            records = data.data;
        } else {
            records = [data];
        }

        if (append) {
            me.#data = me.#data.concat(records);
        } else {
            me.#page = 1;
            me.#data = records;
        }

        me.#total = me.#data.length;
    }

    /**
     * Notify upper components about the finalized data
     * @param {*} name 
     * @param {*} data 
     */
    #notify(name = 'data', data) {
        GSEvents.sendDelayed(1, this, name, data, true);
    }

    #formatFilter(val) {
        let filter = [];

        if (typeof val === 'string') {
            filter = val;
        } else if (Array.isArray(val)) {
            filter = val;
        }
        return filter;
    }

    #formatSort(val = '') {
        let sort = undefined;
        if (typeof val === 'string') {
            sort = [{ col: val }];
        } else if (Array.isArray(val)) {
            sort = val;
        } else if (GSUtil.isNumber(val)) {
            const idx = Math.abs(val);
            sort = new Array(idx);
            sort[idx - 1] = { ord: val };
        }
        return sort;
    }

    get #fields() {
        const me = this;
        const fields = me.table?.header?.fields;
        return fields ? fields : Array.from(me.querySelectorAll('gs-item')).map(o => o.name);
    }

    /*
     * HANDLER SEGMENT 
     */

    /**
     * Override inheriting class data listener callback
     * @param {*} data 
     */
    onRead(data) {
        const me = this;
        me.#update(data);

        if (me.#isLocal) {
            me.disabled = true;
            data = me.#getDataLocal(me.skip, me.limit, me.filter, me.sort, data);
        } else if (me.localFilter || me.localSort) {
            data = me.#getDataLocal(me.skip, me.limit, me.filter, me.sort, data);
        }

        me.#notify('data', data);
    }

}
