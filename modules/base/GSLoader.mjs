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

    static TEMPLATE_URL = self.GS_TEMPLATE_URL || location.origin;

    /**
     * Convert partial URL to a real URL
     * @param {string} url 
     * @return {string}
     */
    static normalizeURL(url = '', nocache = false) {

        url = url || '';
        let path = null;
        const isFile = location.pathname.split('/').pop(-1).indexOf('\.') > -1;

        if (url.startsWith('http')) {
            path = url;
        } else if (url.startsWith('./')) {
            path = `${location.origin}${location.pathname}/.${url}`;
        } else if (url.startsWith('../')) {
            path = `${location.origin}${location.pathname}/${url}`;
        } else if (url.startsWith('/')) {
            path = `${location.origin}${url}`;
        } else if (location.href.endsWith('/')) {
            path = `${location.origin}${location.pathname}/${url}`;
        } else if (isFile) {
            path = `${location.origin}${location.pathname}/../${url}`;
        } else {
            path = `${location.origin}${location.pathname}/${url}`;
        }

        const uri = new URL(path.replaceAll('//', '/'));
        // to handle caching
        if (nocache) uri.searchParams.append('_dc', Date.now());

        return uri.href;
    }

    /**
     * Extrach aprent path from provided URL string
     * @param {string} url 
     * @param {number} level How many levels to go up the chain
     * @returns {string}
     */
    static parentPath(url = '', level = 1) {
        return (url || '').split('/').slice(0, -1 * level).join('/');
    }

    /**
     * Used for override to get predefined template
     * Can be html source or url, checks if load or not
     * @param {string} def
     * @return {string}
     */
    static async getTemplate(def = '') {
        const isRef = def.startsWith('#');
        if (isRef) {
            const el = GSDOM.findEl(def);
            return el ? el.innerHTML : def;
        }
        const isURL = GSUtil.isURL(def);
        if (!isURL) return def;
        def = GSLoader.getTemplateURL(def);
        return  GSLoader.loadSafe(def);
    }

    /**
     * Decode template URL into a real URL
     * @param {string} url 
     * @return {string}
     */
    static getTemplateURL(url = '') {

        const caching = self.GS_DEV_MODE === true;
        if (url.startsWith('//')) {
            return GSLoader.normalizeURL(GSLoader.templateURL + url, caching);
        }

        return GSLoader.normalizeURL(url, caching);
    }

    /**
     * Retrieve default template url
     * @return {string}
     */
    static get templateURL() {
        return GSLoader.normalizeURL(GSLoader.templatePath, false);
    }

    /**
     * Retrieve defult tempalte path
     * @return {string}
     */
    static get templatePath() {
        return GSLoader.TEMPLATE_URL ? GSLoader.TEMPLATE_URL.replace('//', '/') : '';
    }

    /**
     * Load html template (used for template cache)
     * @param {string} val Full or partial url path
     * @param {string} method HTTP methog get|put|post
     * @returns {string}
     * @throws {Error}
     */
    static async loadTemplate(val = '', method = 'GET') {
        const url = GSLoader.getTemplateURL(val);
        return await GSLoader.load(url, method);
    }

    /**
     * Load remote data as text (for loading templates)
     * 
     * @param {string} val Full or partial url path
     * @param {string} method HTTP methog get|put|post
     * @param {boolean} asjson Parse returned data as JSON
     * @returns {object|string}
     */
    static async load(val = '', method = 'GET', headers, asjson = false) {
        let data = null;
        const ct = 'Content-Type';
        headers = headers || {};
        headers[ct] = asjson ? 'application/json' : headers[ct] || 'text/plain';
        const url = GSLoader.normalizeURL(val);
        const res = await fetch(url, { method: method, headers : headers});
        if (res.ok) data = asjson ? await res.json() : await res.text();
        return data;
    }

    /**
     * Load remote data without throwing an exception
     * @param {*} url Full or partial url path
     * @param {*} method http method GET|POST|PUT
     * @param {*} asjson return json or string
     * @param {*} dft default value
     * @returns {object|string}
     */
    static async loadSafe(url = '', method = 'GET', asjson = false, dft) {
        try {
            return GSLoader.load(url, method, asjson);
        } catch (e) {
            GSLog.error(this, e);
        }
        if (dft) return dft;
        return asjson ? {} : '';
    }


    /**
     * Load data from various sources
     * @param {JSON|func|url} val 
     */
    static async loadData(val = '') {
        const isJson = GSUtil.isJson(val);
        const func = !isJson && GSFunction.parseFunction(val);
        const isFunc = GSFunction.isFunction(func);
        const isData = !isFunc && GSUtil.parseValue(val);

        if (isData || isJson) val = GSUtil.toJson(val);

        if (isFunc) {
            const isAsync = GSFunction.isFunctionAsync(func);
            if (isAsync) {
                val = await GSFunction.callFunctionAsync(func, this);
            } else {
                val = GSFunction.callFunction(func);
            }
        }

        if (!GSUtil.isJsonType(val)) return;

        return val;
    }

    static {
        Object.seal(GSLoader);
    }

}