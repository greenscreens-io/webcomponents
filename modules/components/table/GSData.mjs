/*
 * © Green Screens Ltd., 2016. - 2022.
 */

/**
 * A module loading GSData class
 * @module components/table/GSData
 */

import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSListeners from "../../base/GSListeners.mjs";
import GSComponents from "../../base/GSComponents.mjs";

/**
 * Table data handler, pager, loader
 * @class
 * @extends {HTMLElement}
 */
export default class GSData extends HTMLElement {

    static #MODES = ['rest','query','quark'];
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

    static {
        customElements.define('gs-data', GSData);
    }
    
    static get observedAttributes() {
        return ['id', 'src', 'limit', 'skip', 'remote', 'filter', 'sort'];
    }
    
    constructor() {
        super();
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
        
    }

	/*
	 * Called when element injected to parent DOM node
	 */
	connectedCallback() {
		const me = this;
        me.#online = true;
		if (!me.id) me.setAttribute('id', GSID.id);
		GSComponents.store(me);
	}

	/*
	 * Called when element removed from parent DOM node
	 */
	disconnectedCallback() {
        const me = this;
        me.#online = false;
		GSComponents.remove(me);
	}

    /**
     * Wait for event to happen
     * @param {*} name 
     * @returns {void}
     */
    async waitEvent(name = '') {
        if (!name) throw new Error('Event undefined!');
        const me = this;
        return new Promise((r, e) => {
            me.once(name, (evt) => r(evt.detail));
        });
    }

    /**
     * Listen once for triggered event
     * @param {*} name 
     * @param {*} func 
     */
    once(name, func) {
        return this.attachEvent(this, name, func, true);
    }

    /**
     * Attach event to this element
     * @param {*} name 
     * @param {*} func 
     */
    listen(name, func) {
        return this.attachEvent(this, name, func);
    }

    /**
     * Remove event from this element
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
        return GSListeners.attachEvent(this, el, name, fn, once);
    }

    /**
    * Generic event listener remover
    */
    removeEvent(el, name = '', fn) {
        GSListeners.removeEvent(this, el, name, fn);
    }

    /**
     * HTTP operational mode
     * rest, query, quark 
     */
    get mode() {
        const mode = GSUtil.getAttribute(this, 'mode', 'query');
        const isok = GSData.#MODES.indexOf(mode) > -1;
        return isok ? mode : 'query';
    }

    set mode(val = 'query') {
        const isok = GSData.#MODES.indexOf(val) > -1;
        if (isok) return GSUtil.setAttribute(this, 'mode', val);
        console.log(`Invalid mode, allowed: ${GSData.#MODES}`);
    }

    /**
     * Call for defiend mode
     * - quark - JSON path to CRUD object; ie. io.greenscreens.CRUD
     * - rest - url rest format, ie. /${limit}/${skip}?sort=${sort}&filter=${filter}
     * - query - url format, ie. ?limit=${limit}&skip=${skip}&sort=${sort}&filter=${filter}
     */
    get action() {
        const me = this;
        let def = '';
        switch (me.mode) {
            case 'query' : 
                def = '?limit=${limit}&skip=${skip}&sort=${sort}&filter=${filter}';
                break;
            case 'rest' : 
                def = '/${limit}/${skip}?sort=${sort}&filter=${filter}';
                break;
        }
        return GSUtil.getAttribute(me, 'action', def);
    }

    get table() {
        return GSComponents.getOwner(this, 'GS-TABLE')
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
        me.#filter = GSUtil.isString(val) ? JSON.parse(val) : val;
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
    
    /**
     * Total pages
     */
     get pages() {
        const me = this;
        if (me.total === 0) return 1;
        return  me.limit === 0 ? 1: Math.ceil(me.total / me.#limit);
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
        me.page = me.#limit === 0 ? 1: me.pages;
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
        me.clear();
        const url = val || me.src;
        if (url.length === 0) return false;
        opt = opt || {};
        opt.headers = opt.headers || {};
        opt.headers['Content-Type'] = 'application/json; utf-8';
        opt.headers.Accept = 'application/json';
        const res = await fetch(url, opt);
        if (!res.ok) return false;
        let data = await res.json();
        me.setData(data);
        return true;
    }

    setData(data = [], append = false) {
        
        const me = this;
        const isRaw = Array.isArray(data);
        
        let records = data;
        if (isRaw) {
            me.#total = records.length;
        } else if (Array.isArray(data.data)) {
            me.#total = data.total;
            records = data.data;
        } else {
            records = [data];
        }

        me.#data = append ? me.#data.concat(records) : records;
        if (me.#total < me.#data.length) me.#total = me.#data.length;        
        me.#notify(append ? 'append' : 'refresh', me.#data);
    }

    async getData(skip = 0, limit = 0, filter, sort) {
        const me = this;
        filter = me.#formatFilter(filter || me.filter);
        sort = me.#formatSort(sort || me.sort);
        let data = [];

        if (me.remote || me.data.length == 0) {
            const url = me.#toURL(me.src, skip, limit, filter, sort);
            await me.load(url);
            data = me.data;
        } 

        if (!me.remote) {
            data = GSUtil.filterData(filter, me.#data);
            data = GSUtil.sortData(sort, data);
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
        const opt = {limit : limit, skip : skip, sort : encodeURIComponent(sort), filter : encodeURIComponent(filter)};
        return src + GSUtil.fromLiteral(me.action, opt);
    }

    async #notify(name = 'refresh', data) {
        const me = this;
        setTimeout(() => {
            GSUtil.sendEvent(me, name, data, true);
        }, 1);
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
            sort = [{col:val}];
        } else if (Array.isArray(val)) {
            sort = val;
        } else if (GSUtil.isNumber(val)) {
            const idx = Math.abs(val);
            sort = new Array(idx);
            sort[idx-1] = { ord : val};
        }
        return sort;
    }    

}

