/*
 * Copyright (C) 2015, 2023 Green Screens Ltd.
 */

import GSLog from "./GSLog.mjs";
import GSUtil from "./GSUtil.mjs";
import GSLoader from "./GSLoader.mjs";
import GSReadWrite from "./GSReadWrite.mjs";

/**
 * A module loading GSReadWrite class
 * @module base/GSEvent
 */

/**
 * Generic Class for REST data read/write for various components such as grid/form/dynaimc menu etc.
 * @Class
 */
export default class GSReadWriteRest extends GSReadWrite {

    static #MODES = ['rest', 'query', 'quark'];
    static #METHOD = ['GET', 'PUT', 'POST', 'DELETE'];

    #src = '';
    #headers = {};
    #method = 'GET';
    #action = '';
    #mode = 'query';

    #skip = 0;
    #limit = 0;
    #page = 1;

    #sort = [];
    #filter = [];

    constructor(name) {
        super(name);
    }

    /**
     * HTTP operational mode
     * rest, query, quark 
     */
    get mode() {
        return this.#mode || 'query';
    }

    set mode(val = 'query') {
        const isok = GSReadWriteRest.#MODES.includes(val);
        if (isok) return this.#mode = val;
        GSLog.error(null, `Invalid mode, allowed: ${GSReadWriteRest.#MODES}`);
    }

    get method() {
        return this.#method;
    }

    set method(val = '') {
        const isok = GSReadWriteRest.#METHOD.includes(val);
        if (isok) return this.#method = val;
        GSLog.error(null, `Invalid methog, allowed: ${GSReadWriteRest.#METHOD}`);        
    }

    get headers() {
        return Object.assign({}, this.#headers);
    }

    set headers(val = {}) {
        val = GSUtil.toJson(val);
        const me = this;
        me.#headers = Object.assign({}, val);
    }

    get src() {
        return this.#src;
    }

    set src(val = '') {
        const me = this;
        me.#src = val;
    }

    get limit() {
        return this.#limit;
    }

    set limit(val = 0) {
        this.#limit = GSUtil.asNum(val, 0);
    }

    get skip() {
        return this.#skip;
    }

    set skip(val = 0) {
        this.#skip = GSUtil.asNum(val, 0);
    }

    /**
     * Current page
     */
    get page() {
        return this.#page;
    }

    set page(val = 1) {
        this.#page = GSUtil.asNum(val, 1);
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
    }

    get offset() {
        const me = this;
        return (me.page - 1) * me.limit;
    }

    /**
     * Generate URL from src and mode type
     */
    get url() {
        const me = this;
        return me.#toURL(me.#src, me.#skip, me.#limit, me.#filter, me.#sort);
    }
    
    set action(val = '') {
        const me = this;
        me.#action = val;
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
        return me.#action || def;
    }

    #toURL(src, skip, limit, filter, sort) {
        const me = this;
        sort = sort ? JSON.stringify(sort) : '';
        filter = filter ? JSON.stringify(filter) : '';
        const opt = { limit: limit, skip: skip, sort: encodeURIComponent(sort), filter: encodeURIComponent(filter) };
        return src + GSUtil.fromLiteral(me.action, opt);
    }

    /**
     * Override in inherited class
     * @param {} owner 
     * @returns 
     */
    async onRead(owner) {
        const me = this;
        return await GSLoader.load(me.url, 'GET', me.#headers, true);
    }

    /**
     * Override in inherited class
     * @param {} owner 
     * @param {} data
     * @returns 
     */
    async onWrite(owner, data) {
        super.onWrite(owner, data);
    }

}