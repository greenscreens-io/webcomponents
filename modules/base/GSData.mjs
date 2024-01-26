/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading GSData class
 * @module base/GSData
 */

import { GSUtil } from "./GSUtil.mjs";
import { GSDate } from "./GSDate.mjs";

/**
 * A set of static functions used for loading resources
 * @class
 */
export class GSData {

    static PROPERTIES = { name: {}, type: {}, format: {}, currency: {}, locale: {}, extract: {} };

    /**
     * Removes duplicates from list
     * @param {Array} data 
     * @returns {Array}
     */
    static uniqe(data) {
        return Array.from(new Set(data));
    }

    static compareArrays = (a, b) => a.length === b.length && a.every((element, index) => element === b[index]);

    /**
     * Check if two arrays are equal
     * 
     * @param {Array} a 
     * @param {Array} b 
     * @returns {Boolean}
     */
    static arraysEqual(a, b) {

        if (!Array.isArray(a)) return false;
        if (!Array.isArray(b)) return false;
        if (a === b) return true;

        a = a.toSorted();
        b = b.toSorted();

        return GSData.compareArrays(a, b);
    }

    /**
     * Simple array merge, without duplicates. Used by observableAttributes
     * @param {Array} first 
     * @param {Array} second 
     * @returns {Array}
     */
    static mergeArrays(first = [], second = []) {
        return [...first, ...second].filter((value, index, arr) => arr.indexOf(value) === index);
    }

    /**
     * Simple Object merge
     * @param {*} list 
     * @returns 
     */
    static mergeObjects(list = []) {
        let o = {};
        list.filter(o => o).forEach(it => o = { ...o, ...it });
        return o;
    }

    /**
     * Convert data to format by given definition.
     * @param {object} cfg {name:'field_name' , type:'date', format:'d/m/y', currency:'eur', locale:'hr', extract:'REGEX'}
     * @param {*} val 
     * @returns 
     */
    static format(cfg, val) {

        const type = GSData.#toType(cfg, val);
        const locale = cfg.locale || GSUtil.locale;
        const rule = GSUtil.toRegex(cfg.extract, 'g');
        val = rule ? val.match(rule)[0] : val;

        switch (type) {
            case 'timestamp':
                if (val instanceof Date) return val;
                return Date.parse(val);
            case 'date':
                if (val instanceof Date) return val;
                const fmt = GSUtil.asBool(cfg.format) ? undefined : cfg.format;
                if (GSUtil.isString(val)) return GSDate.parse(val, fmt, locale);
                return val && val != 0 ? new GSDate(val).format(fmt, locale) : val;
            case 'string':
            case 'text':   
                if (val instanceof Date) {
                    const fmt = cfg.format || GSUtil.getDateFormat(locale);
                    return new GSDate(val).format(fmt, locale);
                };
                break;
            case 'boolean':
                return GSUtil.asBool(val, false);
            case 'number':
                return GSUtil.asNum(val, val, locale);
            case 'currency':
                if (GSUtil.isString(val)) val = GSUtil.asNum(val);
                const opt = { style: 'currency', currency: cfg.currency };
                return new Intl.NumberFormat(locale, opt).format(val);
        }

        return val;
    }

    static #toType(cfg, val) {
        if (cfg.type) return cfg.type;
        if (val instanceof Date) return 'date';
        if (val instanceof Number) return 'number';
        if (val instanceof Boolean) return 'boolean';
        return typeof val;
    }

    /**
     * Filter array of records 
     * @param {Array} data Array of JSON objects or array of array of primitive types
     * @param {Array<object>|String} filter Check filterComplex function for details
     * @param {Array<String>} fields List of Object properties to check, if not set, all are checked
     * @returns {Array}
     */
    static filterData(data = [], filter = [], fields) {
        data = Array.isArray(data) ? data : [];
        filter = Array.isArray(filter) ? filter : [];
        return filter.length === 0 ? data : data.filter(rec => GSData.filterRecord(rec, filter, fields));
    }

    /**
     * Filter single record to a matchign critheria
     * @param {Array<object>|String} filter Check filterComplex function for details
     * @param {Array} data Array of JSON objects or array of array of primitive types
     * @param {Array<String>} fields List of Object properties to check, if not set, all are checked
     * @returns {Array}
     */
    static filterRecord(rec, filter, fields) {
        const isSimple = typeof filter === 'string';
        return isSimple ? GSData.filterSimple(rec, filter, fields) : GSData.filterComplex(rec, filter);
    }

    /**
     * Check if JSON object contains a value in any of defined properties
     * @param {Object} rec Json object to check
     * @param {String} filter Value to search for
     * @param {Array<string>} fields List of properties to serach
     * @returns {Boolean} Return true if any of given properties (or all) contains provided value
     */
    static filterSimple(rec, filter = '', fields) {
        filter = filter.toLowerCase();
        fields = fields || Object.keys(rec);
        let value = null;
        for (let key of fields) {
            value = rec[key];
            if (value?.toString().toLowerCase().includes(filter)) return true;
        }
        return false;
    }

    /**
     * Check if object contains data in selected properties
     * @todo Add support for eq,gt,lt,like,or operators
     * @param {Object|Array} rec Json object or array of primitive values to check
     * @param {Array<Object>} filter List of filter objects in format
     *        [{name: idx[num] || name[string], value: ''  , op:'eq'}]
     *        Where:
     *           - name is numeric index only if rec is array of primitive values ([1,'a','b',4]...etc)
     *           - name is string if rec is JSON object
     * @returns {Boolean} Flag indicating if record is matched to a given filter critheria
     */
    static filterComplex(rec, filter) {

        let found = true;
        let match = null;

        for (let flt of filter) {
            match = flt?.value?.toString().toLowerCase();
            if (flt.name) {
                found = found && ('' + rec[flt.name]).toLocaleLowerCase().includes(match);
            } else {
                found = found && GSData.filterSimple(rec, flt.value);
            }
            if (!found) break;
        }

        return found;
    }

    /**
     * Sort data
     * @param {*} data 
     * @param {*} sort 
     * @returns {Array}
     */
    static sortData(data, sort) {
        if (sort.length === 0) return data;
        return data.toSorted((a, b) => GSData.sortPair(a, b, sort));
    }

    /**
     * Sort two values, recursion supported
     * @param {*} v1 Array of primitive types or JSON object
     * @param {*} v2 Array of primitive types or JSON object
     * @param {Number} sort -1 | 0 | 1 (descending, as id, ascending )
     * @returns {Number} -1 | 0 | 1
     */
    static sortPair(a, b, sort) {

        const isArray = Array.isArray(a);
        let sts = 0;

        sort.forEach((o, i) => {
            if (!o) return;
            const ord = GSUtil.isNumber(o) ? o : o.ord;
            const idx = GSUtil.isNumber(o.col) ? o.col : i;
            const key = isArray ? idx : o.name;
            const v1 = a[key];
            const v2 = b[key];

            sts = GSData.compare(v1, v2, ord, sts);
        });

        return sts;
    }

    /**
     * Compare two values, recursion supported
     * @param {*} v1 
     * @param {*} v2 
     * @param {Number} order -1 | 0 | 1 (descending, as id, ascending )
     * @param {Number} sts previous value
     * @returns {Number} -1 | 0 | 1
     */
    static compare(v1, v2, order, sts) {
        const me = this;
        if (GSUtil.isNumber(v1) && GSUtil.isNumber(v2)) {
            return sts || GSData.compareNum(v1, v2, order);
        } else if (GSUtil.isString(v1) || GSUtil.isString(v2)) {
            return sts || GSData.compareString(v1, v2, order);
        } else if (GSUtil.isBool(v1) || GSUtil.isBool(v2)) {
            return sts || GSData.compareBool(v1, v2, order);
        } else if (GSUtil.isDate(v1) || GSUtil.isDate(v2)) {
            return sts || GSData.compareNum(Number(v1), Number(v2), order);
        }
        return sts;
    }

    /**
     * Safely compare two boolean values
     * @param {Boolean} v1 
     * @param {Boolean} v2 
     * @param {Number} ord 
     * @returns {Number} -1 | 0 | 1
     */
    static compareBool(v1, v2, ord) {
        v1 = v1 ? 1 : 0;
        v2 = v2 ? 1 : 0;
        return GSData.compareNum(v1, v2, ord);
    }

    /**
     * Compare two string values 
     * @param {String} v1 
     * @param {String} v2 
     * @param {Number} ord 
     * @returns {Number} -1, 1, 0
     */
    static compareString(v1, v2, ord) {
        const s1 = (v1 || '').toString();
        const s2 = (v2 || '').toString();
        return ord < 0 ? s2.localeCompare(s1) : s1.localeCompare(s2);
    }

    /**
     * Compare two numeric values
     * @param {Number} v1 
     * @param {Number} v2 
     * @param {Number} ord positive = ascending, negative - descending 
     * @returns {Number} < 0 or 1 or > 0
     */
    static compareNum(v1, v2, ord) {
        return ord < 0 ? v2 - v1 : v1 - v2;
    }

    /**
     * Write value to JSON object into structured name.
     * Name subelements are separated by dot (users.name etc.).
     * @param {Object} obj 
     * @param {String} name  
     * @param {Boolean} ignoreNull  
     * @param {Object} value 
     */
    static writeToOject(obj, name, value, ignoreNull = true) {
        if (ignoreNull && GSUtil.isNull(value)) return;

        const seg = name.split('.');
        if (seg.length === 1) {
            return GSData.#writeSingleToOject(obj, name, value);
        }

        const tree = seg.slice(0, -1);
        const key = seg.slice(-1)[0];

        tree.forEach(v => {
            if (!obj.hasOwnProperty(v)) obj[v] = {};
            obj = obj[v];
        });

        return GSData.#writeSingleToOject(obj, key, value);
    }

    static #writeSingleToOject(obj, name, value) {
        if (obj.hasOwnProperty(name)) {
            if (!Array.isArray(obj[name])) {
                obj[name] = [obj[name]];
            }
            if (Array.isArray(value)) {
                obj[name] = obj[name].concat(value);
            } else {
                obj[name].push(value);
            }
        } else {
            obj[name] = value;
        }
        return obj;
    }

    /**
     * Read object property by supporting arrays
     * name can be plain name or name[idx]
     * @param {*} obj 
     * @param {String} name 
     * @returns {*}
     */
    static readFromProperty(obj, name) {
        if (GSUtil.isNull(obj)) return;
        const r = /\[\d+\]$/g;
        const isArray = r.test(name);
        let n = name;
        let i = '';

        if (isArray) {
            n = name.replace(r, '')
            i = name.match(r).shift().match(/\d+/).shift();
            i = GSUtil.asNum(i);
            obj = obj.hasOwnProperty(n) ? obj = obj[n][i] : null;
        } else {
            obj = obj.hasOwnProperty(n) ? obj = obj[n] : null;
        }
        return obj;
    }

    /**
     * Read value from JSON object by structured name.
     * Name subelements are separated by dot (users.name etc.).
     * @param {Object} obj 
     * @param {String} name 
     * @returns {*}
     */
    static readFromObject(obj, name) {
        name.split('.')
            .filter(v => !GSUtil.isNull(v))
            .forEach(v => obj = GSData.readFromProperty(obj, v));
        return obj;
    }

    /**
     * Check if named path exist within the object
     * @param {Object} obj 
     * @param {String} name 
     * @returns {Boolean}
     */
    static objectPathExist(obj, name) {
        if (!name) return false;
        return name.split('.')
            .map(v => GSData.readFromProperty(obj, v))
            .filter(v => !GSUtil.isNull(v))
            .length > 0;
    }

    static {
        Object.seal(GSData);
        globalThis.GSData = GSData;
    }
}
