/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * A module loading GSLoader class
 * @module base/GSLoader
 */

import { GSDOM } from "./GSDOM.mjs";
import { GSFunction } from "./GSFunction.mjs";
import { GSLog } from "./GSLog.mjs";
import { GSUtil } from "./GSUtil.mjs";
import { GSVersion } from "./GSVersion.mjs";

/**
 * A set of static functions used for loading resources
 * @class
 */
export class GSLoader {

    static TEMPLATE_URL = globalThis.GS_TEMPLATE_URL || location.origin;
    static ROUTER_URL = globalThis.GS_ROUTER_URL || location.origin;

    static NO_CACHE = false;
    static UNIQUE = GSVersion.build;

    static {
        const rootURL = GSLoader.#defaultURL;
        if (!globalThis.GS_TEMPLATE_URL) {
            GSLoader.TEMPLATE_URL = rootURL;
            globalThis.GS_TEMPLATE_URL = rootURL;
        }

        if (!globalThis.GS_ROUTER_URL) {
            GSLoader.ROUTER_URL = rootURL;
            globalThis.GS_ROUTER_URL = rootURL;
        }

        //const hasKey = Object.hasOwn(self, 'GS_NO_CACHE');
        const hasKey = 'GS_NO_CACHE' in self;
        if (hasKey) {
            GSLoader.NO_CACHE = globalThis.GS_NO_CACHE === true;
            if (localStorage) localStorage.setItem('GS_NO_CACHE', GSLoader.NO_CACHE);
        }
        GSLoader.NO_CACHE = localStorage ? localStorage.getItem('GS_NO_CACHE') == 'true' : false;

    }

    static get #defaultURL() {
        const url = location.href.split('?').pop();
        const seg = url.split('/');
        return url.endsWith('/') ? url : seg.slice(0, -1).join('/');
    }

    /**
     * Convert partial URL to a real URL
     * @param {String} url 
     * @return {String}
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
        //if (!base && GSLoader.NO_CACHE) uri.searchParams.append('_dc', Date.now());
        if (!base) {
            const val = GSLoader.NO_CACHE ? Date.now() : GSLoader.UNIQUE;
            uri.searchParams.append('_dc', val);
        }

        return uri.href;
    }

    /**
     * Extrach parent path from provided URL string
     * @param {String} url 
     * @param {Number} level How many levels to go up the chain
     * @returns {String}
     */
    static parentPath(url = '', level = 1) {
        return (url || '').split('/').slice(0, -1 * level).join('/') + '/';
    }

    /**
     * Used to load router definition from virtual path
     * 
     * @async
     * @param {String} def
     * @return {Promise<string>}
     */
    static async getRouter(def = '') {

        if (!def) return def;

        const isRef = def.startsWith('#');
        if (isRef) {
            const el = GSDOM.query(document.documentElement, def);
            return el ? GSUtil.toJson(el.innerHTML) : {};
        }

        const isHTML = GSUtil.isHTML(def);
        if (isHTML) return def;

        def = GSLoader.#getRouterURL(def);
        return GSLoader.loadSafe(def, 'GET', null, true);
    }

    /**
     * Decode template URL into a real URL
     * @param {String} url 
     * @return {String}
     */
    static #getRouterURL(url = '') {
        url = url.startsWith('//') ? GSLoader.#routerURL + '/' + url : url;
        return GSLoader.normalizeURL(url);
    }

    /**
     * Retrieve default template url
     * @return {String}
     */
    static get #routerURL() {
        return GSLoader.normalizeURL(GSLoader.#routerPath, true);
    }

    /**
     * Retrieve defult template path
     * @return {String}
     */
    static get #routerPath() {
        return GSLoader.ROUTER_URL ? GSLoader.ROUTER_URL.replace('//', '/') : '';
    }

    /**
     * Used for override to get predefined template
     * Can be html source or url, checks if load or not
     * 
     * @async
     * @param {String} def
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
     * @param {String} url 
     * @return {String}
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
     * @return {String}
     */
    static get #templateURL() {
        return GSLoader.normalizeURL(GSLoader.#templatePath, true);
    }

    /**
     * Retrieve defult template path
     * @return {String}
     */
    static get #templatePath() {
        return GSLoader.TEMPLATE_URL ? GSLoader.TEMPLATE_URL.replace('//', '/') : '';
    }

    /**
     * Load html template (used for template cache)
     * 
     * @async
     * @param {String} val Full or partial url path
     * @param {String} method HTTP methog get|put|post
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
     * @param {String} val Full or partial url path
     * @param {String} method HTTP method get|put|post
     * @param {Object} headers HTTP request headers in JSON key/value pairs
     * @param {Boolean} asjson Parse returned data as JSON
     * @param {} body Data to send in a request 
     * @returns {Promise<object|string>}
     */
    static async load(val = '', method = 'GET', headers, asjson = false, body) {
        let data = null;
        const ct = 'Content-Type';
        headers = { ...headers };
        headers[ct] = asjson ? 'application/json; utf-8' : headers[ct] || 'text/plain';
        headers.Accept = 'application/json';
        const url = GSLoader.normalizeURL(val, true);
        const opt = { method: method, headers: headers };
        if (method === 'POST' || method === 'PUT' && body) {
            // TODO - detect if binary
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
     * @param {String} url Full or partial url path
     * @param {String} method http method GET|POST|PUT
     * @param {Object} headers return json or string
     * @param {Boolean} asjson return json or string
     * @param {Object} dft default value
     * @returns {Promise<object|string>}
     */
    static async loadSafe(url = '', method = 'GET', headers, asjson = false, dft, body) {
        try {
            if (url) return GSLoader.load(url, method, headers, asjson, body);
        } catch (e) {
            GSLog.error(null, e);
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

