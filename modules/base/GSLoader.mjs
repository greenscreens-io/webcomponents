/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSLoader class
 * @module base/GSLoader
 */

import GSDOM from "./GSDOM.mjs";
import GSFunction from "./GSFunction.mjs";
import GSLog from "./GSLog.mjs";
import GSUtil from "./GSUtil.mjs";

/**
 * A set of static functions used for loading resources
 * @class
 */
export default class GSLoader {

    static TEMPLATE_URL = globalThis.GS_TEMPLATE_URL || location.origin;
    static NO_CACHE = false;

    static {
        if (!globalThis.GS_TEMPLATE_URL) {
            const url = location.href.split('?').pop();
            let seg = url.split('/');
            GSLoader.TEMPLATE_URL = url.endsWith('/') ? url : seg.slice(0, -1).join('/');
            globalThis.GS_TEMPLATE_URL = GSLoader.TEMPLATE_URL;
        }

        //const hasKey = Object.hasOwn(self, 'GS_NO_CACHE');
        const hasKey = 'GS_NO_CACHE' in self;
        if (hasKey) {
            GSLoader.NO_CACHE = globalThis.GS_NO_CACHE === true;
            if (localStorage) localStorage.setItem('GS_NO_CACHE', GSLoader.NO_CACHE);
        }
        GSLoader.NO_CACHE = localStorage ? localStorage.getItem('GS_NO_CACHE') == 'true' : false;

    }
    /**
     * Convert partial URL to a real URL
     * @param {string} url 
     * @return {string}
     */
    static normalizeURL(url = '', base = false) {

        url = url || '';
        let path = null;
        const isFile = location.pathname.split('/').pop(-1).includes('\.');
        const isExt = url.includes('extension:/');
        const isUrl = url.startsWith('http');

        if (isUrl || isExt) {
            path = url;
        } else if (url.startsWith('/')) {
            path = `${location.origin}/${url}`;
        } else if (isFile) {
            path = `${location.origin}${location.pathname}/../${url}`;
        } else {
            path = `${location.origin}${location.pathname}/${url}`;
        }

        path = path.split('://').map(v => v.replaceAll(/\/{2,}/g, '/')).join('://');
        const uri = new URL(path);

        // to handle caching
        if (!base && GSLoader.NO_CACHE) uri.searchParams.append('_dc', Date.now());

        return uri.href;
    }

    /**
     * Extrach parent path from provided URL string
     * @param {string} url 
     * @param {number} level How many levels to go up the chain
     * @returns {string}
     */
    static parentPath(url = '', level = 1) {
        return (url || '').split('/').slice(0, -1 * level).join('/')+'/';
    }

    /**
     * Used for override to get predefined template
     * Can be html source or url, checks if load or not
     * 
     * @async
     * @param {string} def
     * @return {Promise<string>}
     */
    static async getTemplate(def = '') {

        if (!def) return def;

        const isRef = def.startsWith('#');
        if (isRef) {
            const el = GSDOM.query(document.documentElement, def);
            return el ? el.innerHTML : def;
        }

        const isHTML = GSUtil.isHTML(def);
        if (isHTML) return def;

        def = GSLoader.#getTemplateURL(def);
        return GSLoader.loadSafe(def);
    }

    /**
     * Decode template URL into a real URL
     * @param {string} url 
     * @return {string}
     */
    static #getTemplateURL(url = '') {
        /*
        const isDirect =  /^(https?:\/\/)/i.test(url);
        url = isDirect ? url : GSLoader.#templateURL + '/' + url;
        */
        url = url.startsWith('//') ? GSLoader.#templateURL + '/' + url : url;
        return GSLoader.normalizeURL(url);
    }

    /**
     * Retrieve default template url
     * @return {string}
     */
    static get #templateURL() {
        return GSLoader.normalizeURL(GSLoader.#templatePath, true);
    }

    /**
     * Retrieve defult template path
     * @return {string}
     */
    static get #templatePath() {
        return GSLoader.TEMPLATE_URL ? GSLoader.TEMPLATE_URL.replace('//', '/') : '';
    }

    /**
     * Load html template (used for template cache)
     * 
     * @async
     * @param {string} val Full or partial url path
     * @param {string} method HTTP methog get|put|post
     * @returns {Promise<string>}
     * @throws {Error}
     */
    static async loadTemplate(val = '', method = 'GET') {
        const url = GSLoader.#getTemplateURL(val);
        return await GSLoader.load(url, method);
    }

    /**
     * Load remote data as text (for loading templates)
     * 
     * @async
     * @param {string} val Full or partial url path
     * @param {string} method HTTP methog get|put|post
     * @param {boolean} asjson Parse returned data as JSON
     * @returns {Promise<object|string>}
     */
    static async load(val = '', method = 'GET', headers, asjson = false, body) {
        let data = null;
        const ct = 'Content-Type';
        headers = headers || {};
        headers[ct] = asjson ? 'application/json' : headers[ct] || 'text/plain';
        const url = GSLoader.normalizeURL(val, true);
        const opt  ={ method: method, headers: headers };
        if (method === 'POST' || method === 'PUT' && body) {
            opt.body = JSON.stringify(body);
        }
        const res = await fetch(url, opt);
        if (res.ok) data = asjson ? await res.json() : await res.text();
        return data;
    }

    /**
     * Load remote data without throwing an exception
     * 
     * @async
     * @param {string} url Full or partial url path
     * @param {string} method http method GET|POST|PUT
     * @param {object} headers return json or string
     * @param {boolean} asjson return json or string
     * @param {object} dft default value
     * @returns {Promise<object|string>}
     */
    static async loadSafe(url = '', method = 'GET', headers, asjson = false, dft, body) {
        try {
            if (url) return GSLoader.load(url, method, headers, asjson, body);
        } catch (e) {
            GSLog.error(this, e);
        }
        if (dft) return dft;
        return asjson ? {} : '';
    }


    /**
     * Load data from various sources
     * 
     * @async
     * @param {JSON|func|url} val 
     * @returns {Promise}
     */
    static async loadData(val = '') {

        const isJson = GSUtil.isJson(val);
        const func = !isJson && GSFunction.parseFunction(val);
        const isFunc = func && GSFunction.isFunction(func);
        const isData = !isFunc && GSUtil.parseValue(val);

        if (isData || isJson) val = GSUtil.toJson(val);

        if (isFunc) val = await GSFunction.callFunction(func);

        if (!GSUtil.isJsonType(val)) return;

        return val;
    }

    static {
        Object.seal(GSLoader);
        globalThis.GSLoader = GSLoader;
    }

}
