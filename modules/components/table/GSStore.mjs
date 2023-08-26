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
import GSLog from "../../base/GSLog.mjs";
import GSPromise from "../../base/GSPromise.mjs";
import GSReadWriteRegistry from "../../base/GSReadWriteRegistry.mjs";

/**
 * Table data handler, pager, loader
 * @class
 * @extends {HTMLElement}
 */
export default class GSStore extends HTMLElement {

    static #MODES = ['rest', 'query', 'quark'];
    #online = false;
    #src = '';
    #data = [];

    #remote = false;
    #skip = 0;
    #limit = 0;
    #page = 1;

    #sort = [];
    #filter = [];
    #total = 0;

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

        if (GSComponents.hasSetter(me, name)) {
            me[name] = newValue;
        }

        if (name === 'src') {
            me.#data = [];
            me.reload();
            return;
        }

        if (name === 'storage') return me.#onStorage(oldValue, newValue);

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

    /**
     * HTTP operational mode
     * rest, query, quark 
     */
    get mode() {
        const mode = GSAttr.get(this, 'mode', 'query');
        const isok = GSStore.#MODES.includes(mode);
        return isok ? mode : 'query';
    }

    set mode(val = 'query') {
        const isok = GSStore.#MODES.includes(val);
        if (isok) return GSAttr.set(this, 'mode', val);
        GSLog.error(null, `Invalid mode, allowed: ${GSStore.#MODES}`);
    }
    
    /**
     * Call for defined mode
     * - quark - JSON path to CRUD object; ie. io.greenscreens.CRUD
     * - rest - url rest format, ie. /${limit}/${skip}?sort=${sort}&filter=${filter}
     * - query - url format, ie. ?limit=${limit}&skip=${skip}&sort=${sort}&filter=${filter}
     */
    get action() {
        const me = this;
        let def = '';
        switch (me.mode) {
            case 'query':
                def = '?limit=${limit}&skip=${skip}&sort=${sort}&filter=${filter}';
                break;
            case 'rest':
                def = '/${limit}/${skip}?sort=${sort}&filter=${filter}';
                break;
        }
        return GSAttr.get(me, 'action', def);
    }

    get table() {
        return GSDOM.closest(this, 'GS-TABLE')
    }

    /**
     * Generate URL from src and mode type
     */
    get url() {
        const me = this;
        return me.#toURL(me.src, me.skip, me.limit, me.filter, me.sort);
    }

    /**
     * Table data url (JSON)
     */
    get src() {
        return this.#src;
    }

    set src(val = '') {
        const me = this;
        me.#src = val;
        me.reload();
    }

    get limit() {
        return this.#limit;
    }

    set limit(val = 0) {
        const me = this;
        me.#limit = GSUtil.asNum(val);
        me.reload();
    }

    get skip() {
        return this.#skip;
    }

    set skip(val = 0) {
        const me = this;
        me.#skip = GSUtil.asNum(val);
        me.reload();
    }

    /**
     * if true, on every request data is loded from remote
     * if false, data is loaded once and cached
     */
    get remote() {
        return this.#remote;
    }

    set remote(val = false) {
        const me = this;
        me.#remote = GSUtil.asBool(val);
        me.reload();
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

    get offset() {
        const me = this;
        return (me.page - 1) * me.limit;
    }

    /**
     * Current page
     */
    get page() {
        return this.#page;
    }

    set page(val = 1) {
        if (!GSUtil.isNumber(val)) throw new Error('Numeric value required!');
        const me = this;
        me.#page = GSUtil.asNum(val < 1 ? 1 : val);
        me.#page = me.#page > me.pages ? me.pages : me.#page;
        const skip = me.#limit * (val - 1);
        me.getData(skip, me.#limit, me.#filter, me.#sort);
    }

    get storage() {
        return GSAttr.get(this, 'storage', '');
    }
   

    /**
     * Total pages
     */
    get pages() {
        const me = this;
        if (me.total === 0) return 1;
        return me.limit === 0 ? 1 : Math.ceil(me.total / me.#limit);
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
        me.page = me.#limit === 0 ? 1 : me.pages;
        return me.#page;
    }

    firstPage() {
        const me = this;
        me.page = 1;
        return me.#page;
    }

    clear() {
        const me = this;
        me.#total = 0;
        me.setData();
    }

    async load(val, opt) {
        const me = this;
        if (!me.#online) return false;
        const url = val || me.src;
        if (url.length === 0) return false;
        opt = opt || {};
        opt.headers = opt.headers || {};
        opt.headers['Content-Type'] = 'application/json; utf-8';
        opt.headers.Accept = 'application/json';
        const res = await fetch(url, opt);
        if (!res.ok) return false;
        const data = await res.json();
        me.#update(data);
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

        const simple = GSUtil.isString(filter) && GSUtil.isStringNonEmpty(filter);

        if (!simple && me.src && (me.remote || me.data.length == 0)) {
            const url = me.#toURL(me.src, skip, limit, filter, sort);
            data = await me.load(url);
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

    reload() {
        const me = this;
        if (!me.#online) return;
        return me.getData(me.skip, me.limit, me.filter, me.sort);
    }

    #toURL(src, skip, limit, filter, sort) {
        const me = this;
        sort = sort ? JSON.stringify(sort) : '';
        filter = filter ? JSON.stringify(filter) : '';
        const opt = { limit: limit, skip: skip, sort: encodeURIComponent(sort), filter: encodeURIComponent(filter) };
        return src + GSUtil.fromLiteral(me.action, opt);
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


    get #handler() {
        return GSReadWriteRegistry.find(this.storage);
    }

    async #onStorage(oldValue, newValue) {
        if (newValue == oldValue) return;
        const me = this;
        me.#controller?.abort();
        const old = GSReadWriteRegistry.find(oldValue);
        GSEvents.unlisten(me, old, 'read', me.#reader);
        if (!newValue) return;
        me.#controller = new AbortController();
        await GSReadWriteRegistry.wait(newValue, me.#controller.signal);
        GSEvents.attach(me, me.#handler, 'read', me.#reader);
        await me.#handler?.read(me);
    }

    #onRead(e) {
        if (e.detail.data) this.setData(e.detail.data);
    }

}


