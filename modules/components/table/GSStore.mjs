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
        this.#data = [];    
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
        return Array.isArray(me.#data) && me.#data.length >0;
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
        // me.skip = me.limit * (val - 1);
        const skip = me.limit * (val - 1);
        me.getData(skip, me.limit, me.filter, me.sort);
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

    get sort() {
        return super.sort;
    }
    
    get filter() {
        return super.filter;
    }       

    set sort(val) {
        const me = this;
        super.sort = me.#formatSort(val);
        if (me.disabled) me.reload();
    }

    set filter(val) {
        const me = this;
        super.filter = me.#formatFilter(val);
        if (me.disabled) me.reload();
    }

    /*
     * INTERNAL SEGMENT
     */

    clear() {
        const me = this;
        me.#total = 0;
        me.setData();
    }

    reload(clear = false) {
        const me = this;
        if (clear) me.#data = [];
        return me.getData(me.skip, me.limit, me.filter, me.sort);
    }
    
    setData(data = [], append = false) {
        const me = this;
        me.#update(data, append);
        return me.reload();
    }

    async getData(skip = 0, limit = 0, filter, sort) {
        const me = this;
        filter = me.#formatFilter(filter || me.filter);
        sort = me.#formatSort(sort || me.sort);
        let data = [];

        const local = me.isCached && me.cached;
        // const filtered = !me.cached && GSUtil.isString(filter) && GSUtil.isStringNonEmpty(filter);
        
        if (local) {
            data = GSData.filterData(filter, me.#data, me.#fields);
            data = GSData.sortData(sort, data);
            limit = limit === 0 ? data.length : limit;
            data = data.slice(skip, skip + limit);
            me.#notify('data', data);
        } else {
            me.filter = filter; 
            me.sort = me.sort;
            me.skip = skip;
            me.limit = limit;
            data = await me.read();
        }

        return data;
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

    #notify(name = 'data', data) {
        GSEvents.sendDelayed(1, this, name, data, true);
    }

    #formatFilter(val) {
        let filter = [];

        if (typeof val === 'string') {
            filter = val;
            /*
            this.#fields
                .filter(v=> GSUtil.isStringNonEmpty(v))
                .map(name => { return {"name":name, "value":val}});
            */
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

    onRead(data) {
        const me = this;
        me.#update(data);
        const local = me.cached && me.isCached;
        if (!local) return me.#notify('data', data);

        me.disabled = true;

        const filter = me.#formatFilter(me.filter);
        const sort = me.#formatSort(me.sort);

        data = GSData.filterData(filter, me.#data, me.#fields);
        data = GSData.sortData(sort, data);
        const limit = me.limit === 0 ? data.length : me.limit;
        data = data.slice(me.skip, me.skip + limit);

        me.#notify('data', data);
    }

}
