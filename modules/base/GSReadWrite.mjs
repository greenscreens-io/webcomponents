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
 * Generic Class for QUERY/REST data read/write for various components such as grid/form/dynamic menu etc.
 * Also, Green Screens Quark Engine or external functions are supported.
 * If mode="", instance is used as local reader. 
 * Use events to detect read/write requests or manually populate using this.setData([...]) 
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

    /**
     * Instance constructor
     * @param {string} name Unique handler name
     * @param {boolean} enabled Automatically registe in global registry. 
     */
    constructor(name, enabled) {
        super(name, enabled);
    }

    /**
     * Handler operational mode
     * rest, query, quark 
     * @returns {string} Operational mode
     */
    get mode() {
        return GSUtil.normalize(this.#mode);
    }

    /**
     * Handler operational mode
     * Values: '', query, rest, quark
     * @var {String} 
     */
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

    /**
     * HTTP method for reader (query/rest)
     * @returns {string} Values GET,POST,PUT
     */
    get reader() {
        return this.#reader;
    }

    /**
     * HTTP method for reader (query/rest)
     * Values GET,POST,PUT
     * @var {String} 
     */    
    set reader(val) {
        const me = this;
        const isok = me.isQuark ? true : GSReadWrite.#METHOD.includes(val);
        if (!isok) throw new Error(null, `Invalid method, allowed: ${GSReadWrite.#METHOD}`);
        return me.#reader = val;
    }

    /**
     * HTTP method for writer (query/rest)
     * @returns {string} Values POST,PUT
     */
    get writer() {
        return this.#writer;
    }

    /**
     * HTTP method for writer (query/rest)
     * Values POST,PUT
     * @var {String} 
     */       
    set writer(val) {
        const me = this;
        const isok = me.isQuark ? true : GSReadWrite.#METHOD.includes(val);
        if (!isok) throw new Error(null, `Invalid method, allowed: ${GSReadWrite.#METHOD}`);
        return this.#writer = val;
    }

    /**
     * Custom HTTP headers
     * @returns {Object} Json structure
     */
    get headers() {
        return Object.assign({}, this.#headers);
    }

    /**
     * Custom HTTP headersas String or Json structure
     * @var {Object} 
     */    
    set headers(val = {}) {
        val = GSUtil.toJson(val);
        const me = this;
        me.#headers = Object.assign({}, val);
    }

    /**
     * Base URL part
     * @returns {string} 
     */
    get src() {
        return this.#src;
    }

    /**
     * Base URL part
     * @var {String} 
     */    
    set src(val = '') {
        const me = this;
        me.#src = val;
    }

    /**
     * Number of records to return
     * @returns {Number} 
     */
    get limit() {
        return this.#limit;
    }

    /**
     * Number of records to return
     * @var {Number} 
     */    
    set limit(val = 10) {
        this.#limit = GSUtil.asNum(val, 10);
    }

    /**
     * Number of records to skip
     * @returns {Number} 
     */
    get skip() {
        return this.#skip;
    }

    /**
     * Number of records to skip
     * @var {Number} 
     */        
    set skip(val = 0) {
        this.#skip = GSUtil.asNum(val, 0);
    }

    /**
     * Filter data in format 
     * [{name: idx[num] || name[string], value: ''  , op:'eq'}]
     * @returns {Array<Object>} 
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
     * @returns {Array<Object>} 
     */
    get sort() {
        return this.#sort;
    }

    set sort(val) {
        const me = this;
        me.#sort = GSUtil.isString(val) ? JSON.parse(val) : val;
    }

    /**
     * Generated URL segment based on selected mode (query/rest)
     * - quark - JSON path to CRUD object; ie. io.greenscreens.CRUD
     * - rest - url rest format, ie. /${limit}/${skip}?sort=${sort}&filter=${filter}
     * - query - url format, ie. ?limit=${limit}&skip=${skip}&sort=${sort}&filter=${filter}
     * @returns {string} 
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
     * Set custom URL segment to be attached to based 'src'.
     * Format depends on mode[query|rest]
     * @var {String}
     */
    set action(val = '') {
        const me = this;
        me.#action = val;
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

    /**
     * If handler is local for manual data entry
     * @returns {boolean}
     */
    get isOffline() {
        return this.mode === '';
    }

    /**
     * If handler is for Green Screens Quark Engine or custom global function.
     * @returns {boolean}
     */
    get isQuark() {
        return this.mode === 'quark';
    }

    /**
     * If handler is for HTTP requests (query|rest)
     * @returns {boolean}
     */
    get isRemote() {
        return ['rest' ,'query'].indexOf(this.mode) > -1;
    }

    /**
     * Override in inherited class
     * @param {} owner Calling HTMLElement
     * @returns {Array<Object>} Json Array data loaded 
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
     * @param {} owner Calling HTMLElement
     * @param {Object} data JSON object to send to the remote
     * @returns {Object} Json Object with write response
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

    /**
     * Register generic handler under unique name.
     * @param {string} name Unique handler name
     * @returns {GSReadWrite} Data handler instance
     */
    static register(name) {
        return new GSReadWrite(name, true);
    }

}