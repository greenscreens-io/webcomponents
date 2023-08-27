/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSStore class
 * @module components/table/GSStore
 */

import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSEvents from "../../base/GSEvents.mjs";
import GSComponents from "../../base/GSComponents.mjs";
import GSData from "../../base/GSData.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSItem from "../../base/GSItem.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSPromise from "../../base/GSPromise.mjs";
import GSReadWriteRegistry from "../../base/GSReadWriteRegistry.mjs";
import GSReadWrite from "../../base/GSReadWrite.mjs";

/**
 * Table data handler, pager, loader
 * @class
 * @extends {HTMLElement}
 */
export default class GSStore extends HTMLElement {

    #online = false;
    #data = [];

    #page = 1;

    #sort = [];
    #filter = [];
    #total = 0;

    #handlerID = '';
    #controller;
    #reader;

    static {
        customElements.define('gs-store', GSStore);
        Object.seal(GSStore);
    }

    static get observedAttributes() {
        return ['id', 'src', 'limit', 'skip', 'remote', 'filter', 'sort', 'storage'];
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
        this.#reader = this.#onRead.bind(this);
    }

    attributeChangedCallback(name = '', oldValue = '', newValue = '') {
        const me = this;

        if (name === 'id') {
            GSComponents.remove(oldValue);
            GSComponents.store(me);
            return;
        }

        if (name === 'src') return me.#onSrcChange(oldValue, newValue);
        if (name === 'storage') return me.#onStorageChange(oldValue, newValue);

        if (GSComponents.hasSetter(me, name)) return me.reload();
    }

    /*
     * Called when element injected to parent DOM node
     */
    connectedCallback() {
        const me = this;
        me.#online = true;
        GSID.setIf(me);
        GSComponents.store(me);
    }

    /*
     * Called when element removed from parent DOM node
     */
    disconnectedCallback() {
        const me = this;
        me.#online = false;
        me.#controller?.abort();
        GSReadWriteRegistry.find(me.#handlerID)?.disable();
        GSComponents.remove(me);
    }

    /**
     * Wait for event to happen
     * 
     * @async
     * @param {*} name 
     * @returns {Promise<void>}
     */
    async waitEvent(name = '', signal) {
        const me = this;
        const callback = (resolve, reject) => {
            me.once(name, (evt) => resolve(evt.detail));
        }
        return new GSPromise(callback, signal).await();
    }

    /**
     * Listen once for triggered event
     * 
     * @param {*} name 
     * @param {*} func 
     */
    once(name, func) {
        return this.attachEvent(this, name, func, true);
    }

    /**
     * Attach event to this element
     * 
     * @param {*} name 
     * @param {*} func 
     */
    listen(name, func) {
        return this.attachEvent(this, name, func);
    }

    /**
     * Remove event from this element
     * 
     * @param {*} name 
     * @param {*} func 
     */
    unlisten(name, func) {
        this.removeEvent(this, name, func);
    }

    /**
    * Generic event listener appender
    * TODO handle once events to self remove
    * TODO handle fucntion key override with same function signature dif instance
    */
    attachEvent(el, name = '', fn, once = false) {
        return GSEvents.attach(this, el, name, fn, once);
    }

    /**
    * Generic event listener remover
    */
    removeEvent(el, name = '', fn) {
        GSEvents.remove(this, el, name, fn);
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
     * HTTP operational mode
     * rest, query, quark 
     */
    get mode() {
        return GSAttr.get(this, 'mode', 'query');
    }

    set mode(val = 'query') {
        return GSAttr.set(this, 'mode', val);
    }

    get action() {
        return GSAttr.get(this, 'action');
    }

    /**
     * Table data url (JSON)
     */
    get src() {
        return GSAttr.get(this, 'src', '');
    }

    set src(val = '') {
        return GSAttr.set(this, 'src', val);
    }

    get limit() {
        return GSAttr.getAsNum(this, 'limit', 0);
    }

    set limit(val = 0) {
        return GSAttr.setAsNum(this, 'limit', val, 0);
    }

    get skip() {
        return GSAttr.getAsNum(this, 'skip', 0);
    }

    set skip(val = 0) {
        return GSAttr.setAsNum(this, 'skip', val, 0);
    }

    get storage() {
        return GSAttr.get(this, 'storage', '');
    }
    
    set storage(val = '') {
        return GSAttr.set(this, 'storage', val);
    }

    /**
     * if true, on every request data is loded from remote
     * if false, data is loaded once and cached
     */
    get remote() {
        return GSAttr.getAsBool(this, 'remote', false);
    }

    set remote(val = false) {
        return GSAttr.setAsBool(this, 'remote', val, false);
    }

    /**
     * Filter data in format 
     * [{name: idx[num] || name[string], value: ''  , op:'eq'}]
     */
    get filter() {
        return this.#filter;
    }

    set filter(val) {
        const me = this;
        me.#filter = GSUtil.isJson(val) ? GSUtil.toJson(val) : val;
        me.reload();
    }

    /**
     * Sort data in format
     * [{col: idx[num] || name[string]  , op: -1 | 1 }]
     */
    get sort() {
        return this.#sort;
    }

    set sort(val) {
        const me = this;
        me.#sort = GSUtil.isString(val) ? JSON.parse(val) : val;
        me.reload();
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
        me.skip = me.limit * (val - 1);
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
    
    /*
     * INTERNAL SEGMENT
     */

    clear() {
        const me = this;
        me.#total = 0;
        me.setData();
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

    setData(data = [], append = false) {
        const me = this;
        me.#update(data, append);
        me.getData(me.skip, me.limit, me.#filter, me.#sort);
    }

    async getData(skip = 0, limit = 0, filter, sort) {
        const me = this;
        filter = me.#formatFilter(filter || me.filter);
        sort = me.#formatSort(sort || me.sort);
        let data = [];

        const filtered = me.remote && GSUtil.isString(filter) && GSUtil.isStringNonEmpty(filter);

        if (filtered || me.remote || me.data.length == 0) {
            me.#updateHandler(me.#handler);
            data = await me.#handler?.read(me);
        }

        if (!me.remote) {
            const fields = me.#fields();
            data = GSData.filterData(filter, me.#data, fields);
            data = GSData.sortData(sort, data);
            limit = limit === 0 ? data.length : limit;
            data = data.slice(skip, skip + limit);
        }

        me.#notify('data', data);
        return data;
    }

    reload(clear = false) {
        const me = this;
        if (!me.#online) return;
        if (clear) me.#data = [];
        return me.getData(me.skip, me.limit, me.filter, me.sort);
    }

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

    #fields() {
        const me = this;
        const fields = me.table?.header?.fields;
        return fields ? fields : Array.from(me.querySelectorAll('gs-item')).map(o => o.name);
    }

    /*
     * HANDLER SEGMENT 
     */

    #handlerName(name, internal) {
        const me = this;
        name = name || me.storage || 'handler';
        return internal ? `${me.id}-${name}` : name;
    }

    get #handler() {
        const me = this;
        const name = me.#handlerName(me.storage, me.src);
        return GSReadWriteRegistry.find(name);
    }

    #updateHandler(handler, internal = false) {
        if (!handler) return;
        const me = this;
        if(internal) handler.src = me.src;
        handler.action = me.action;
        handler.mode = me.mode;
        handler.limit = me.limit;
        handler.filter = me.filter;
        handler.sort = me.sort;
    }

    async #initHandler(name, internal = false) {
        const me = this;
        if (!internal && GSUtil.isStringEmpty(name)) return me.clear();
        name = me.#handlerName(name, internal);
        if (internal) me.#handlerID = GSReadWrite.register(name).id;
        if (!me.#controller || me.#controller?.signal.aborted) me.#controller = new AbortController();
        const handler = await GSReadWriteRegistry.wait(name, me.#controller?.signal);
        GSEvents.attach(me, handler, 'read', me.#reader);
        me.#updateHandler(handler, internal);
        await handler?.read(me);
    }

    #cancelHandler(name, internal = false) {
        const me = this;
        me.#controller?.abort();
        name = me.#handlerName(name, internal);
        const old = GSReadWriteRegistry.find(name);
        if (internal) old?.disable();
        GSEvents.remove(me, old, 'read', me.#reader);
        me.reload(true);
    }
    
    #onSrcChange(oldValue, newValue) {
        if (newValue == oldValue) return;
        const me = this;
        const oldInternal = GSUtil.isStringNonEmpty(oldValue);
        const newInternal = GSUtil.isStringNonEmpty(newValue);
        if (oldInternal != newInternal) {
            me.#cancelHandler(me.storage, oldInternal);    
            me.#initHandler(me.storage, newInternal);
        } else {
            me.#updateHandler(me.#handler, oldInternal && newInternal);
            me.#handler?.read(me);
        }
    }

    #onStorageChange(oldValue, newValue) {
        if (newValue == oldValue) return;
        const me = this;
        const oldInternal = oldValue && this.src;
        const newInternal = newValue && this.src;
        me.#cancelHandler(oldValue, oldInternal);
        me.#initHandler(newValue, newInternal);
    }

    #onRead(e) {
        if (e.detail.data) this.setData(e.detail.data);
    }

}
