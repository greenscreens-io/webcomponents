/*
 * Copyright (C) 2015, 2023 Green Screens Ltd.
 */

import GSUtil from "./GSUtil.mjs";
import GSLoader from "./GSLoader.mjs";
import GSAbstractReadWrite from "./GSAbstractReadWrite.mjs";
import GSFunction from "./GSFunction.mjs";

/**
 * A module loading GSReadWrite class
 * @module base/GSEvent
 */

/**
 * Generic Class for REST data read/write for various components such as grid/form/dynamic menu etc.
 * @Class
 */
export default class GSReadWrite extends GSAbstractReadWrite {

    static #MODES = ['', 'rest', 'query', 'quark'];
    static #METHOD = ['GET', 'PUT', 'POST', 'DELETE'];

    #src = '';
    #headers = {};
    #reader = 'GET';
    #writer = 'POST';
    #action = '';
    #mode = '';

    #skip = 0;
    #limit = 0;

    #sort = [];
    #filter = [];

    constructor(name, enabled) {
        super(name, enabled);
    }

    /**
     * HTTP operational mode
     * rest, query, quark 
     */
    get mode() {
        return GSUtil.normalize(this.#mode);
    }

    set mode(val) {
        const me = this;
        val = GSUtil.normalize(val);
        const isok = GSReadWrite.#MODES.includes(val);
        if (!isok) throw new Error(null, `Invalid mode, allowed: ${GSReadWrite.#MODES}`);
        if (me.#mode === 'quark' && me.#mode != val) {
            me.#reader = 'GET';
            me.#writer = 'POST';
        }
        return this.#mode = val;
    }

    get reader() {
        return this.#reader;
    }

    set reader(val) {
        const me = this;
        const isok = me.isQuark ? true : GSReadWrite.#METHOD.includes(val);
        if (!isok) throw new Error(null, `Invalid method, allowed: ${GSReadWrite.#METHOD}`);
        return me.#reader = val;
    }

    get writer() {
        return this.#writer;
    }

    set writer(val) {
        const me = this;
        const isok = me.isQuark ? true : GSReadWrite.#METHOD.includes(val);
        if (!isok) throw new Error(null, `Invalid method, allowed: ${GSReadWrite.#METHOD}`);
        return this.#writer = val;
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

    /**
    * Generate URL from src and mode type
    */
    get url() {
        const me = this;
        return me.#toURL(me.#src, me.#skip, me.#limit, me.#filter, me.#sort);
    }

    #toURL(src, skip, limit, filter, sort) {
        const me = this;
        if (GSUtil.isStringEmpty(src)) throw new Error('Attribute "src" not set!');
        sort = sort ? JSON.stringify(sort) : '';
        filter = filter ? JSON.stringify(filter) : '';
        const opt = { limit: limit, skip: skip, sort: encodeURIComponent(sort), filter: encodeURIComponent(filter) };
        return src + GSUtil.fromLiteral(me.action, opt);
    }

    get isOffline() {
        return this.mode === '';
    }

    get isQuark() {
        return this.mode === 'quark';
    }

    get isRemote() {
        return ['rest' ,'query'].indexOf(this.mode) > -1;
    }

    /**
     * Override in inherited class
     * @param {} owner 
     * @returns 
     */
    async onRead(owner) {
        const me = this;
        if (me.isOffline) return;
        if (!me.#reader) return super.onRead(owner);
        if (me.isRemote) return await GSLoader.load(me.url, me.#reader, me.#headers, true);
        if (!me.isQuark) return;
        const fn = GSFunction.parseFunction(me.#reader);
        if (!fn) throw new Error('Reader quark function not found!')
        return fn(me.skip, me.limit, me.filter, me.sort);
    }

    /**
     * Override in inherited class
     * @param {} owner 
     * @param {} data
     * @returns 
     */
    async onWrite(owner, data) {
        const me = this;
        if (me.isOffline) return;
        if (!me.#writer) return super.onWrite(owner);
        if (!me.isRemote) return await GSLoader.load(me.url, me.#writer, me.#headers, true, data);
        if (!me.isQuark) return;
        const fn = GSFunction.parseFunction(me.#reader);
        if (!fn) throw new Error('Writer quark function not found!')
        return fn(data);
    }

    static register(name) {
        return new GSReadWrite(name, true);
    }

}