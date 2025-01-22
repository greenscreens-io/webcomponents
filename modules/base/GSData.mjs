/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSData class
 * @module base/GSData
 */

import { GSUtil } from "./GSUtil.mjs";
import { GSDate } from "./GSDate.mjs";
import { GSAttr } from "./GSAttr.mjs";

/**
 * A set of static functions used for loading resources
 * @class
 */
export class GSData {

    static PROPERTIES = { name: {}, type: {}, format: {}, currency: {}, locale: {}, extract: {}, key: { type: Boolean } };

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

        // intercept overrides; used b GS-TABLE cell Ui remapping
        if (cfg.childElementCount > 0) {
            const el = cfg.querySelector(`gs-item[value="${val}"]`);
            return GSAttr.get(el, "map", val);
        }

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
    static *filter(data = [], filter = [], fields, limit = 0) {
        let cnt = 0;
        let sts = false;
        for (let rec of data) {
            sts = GSData.filterRecord(rec, filter, fields);
            if (sts) {
                cnt++
                yield rec;
            }
            if (limit > 0 && cnt >= limit) break;
        }
    }

    /**
     * Filter array of records 
     * @param {Array} data Array of JSON objects or array of array of primitive types
     * @param {Array<object>|String} filter Check filterComplex function for details
     * @param {Array<String>} fields List of Object properties to check, if not set, all are checked
     * @returns {Array}
     */
    static filterData(data = [], filter = [], fields, limit = 0) {
        data = Array.isArray(data) ? data : [data];
        filter = Array.isArray(filter) ? filter : [filter];
        if (filter.length === 0) return data;
        return [...GSData.filter(data, filter, fields, limit)];
    }

    /**
     * Filter single record to a matchign critheria
     * @param {Array<object>|String} filter Check filterComplex function for details
     * @param {Array} data Array of JSON objects or array of array of primitive types
     * @param {Array<String>} fields List of Object properties to check, if not set, all are checked
     * @returns {Array}
     */
    static filterRecord(rec, filter, fields) {
        const isSimple = GSUtil.isPrimitive(filter);
        return isSimple ? GSData.filterSimple(rec, filter, fields) : GSData.filterComplex(rec, filter, fields);
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
            if (GSData.filterValue(value, filter)) return true;
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
    static filterComplex(rec, filter, fields) {

        let primitive = false;
        let found = true;
        let value = null;

        for (let flt of filter) {

            primitive = GSUtil.isPrimitive(flt);
            if (primitive) {
                found = found && GSData.filterSimple(rec, flt, fields);
            } else {
                value = rec[flt.name];
                if (flt.name) {
                    found = found && GSData.filterValue(value, flt)
                } else {
                    found = found && GSData.filterSimple(rec, flt.value, fields);
                }
            }

            if (!found) break;
        }

        return found;
    }

    static filterValue(value, filter) {
        const toCheck = GSUtil.isPrimitive(filter) ? filter : filter.value;
        if (GSUtil.isDate(value)) {
            return GSData.matchDate(value, filter);
        } else if (GSUtil.isNumber(value)) {
            return GSData.matchNumber(value, GSUtil.asNum(toCheck, null), filter.op);
        } else {
            return (GSUtil.normalize(value)).toLocaleLowerCase().includes(GSUtil.normalize(toCheck).toLocaleLowerCase());
        }
    }

    static matchDate(val, filter, locale) {

        if (typeof filter === 'string') {
            const value = '' + filter;
            const local = val.toLocaleDateString(locale);
            const iso = val.toISOString();
            return local.includes(value) || iso.includes(value);
        }

        if (!filter.value) return false;

        const qry = filter.value instanceof Date ? 'date' : typeof filter.value;

        switch (qry) {
            case 'number':
                return GSData.matchNumber(val.getTime(), filter.value, filter.op);
            case 'date':
                return GSData.matchNumber(val.getTime(), filter.value.getTime(), filter.op);
        }

        return GSData.matchDate(val, '' + filter.value, filter.locale);
    }

    /**
     * Match number by operator
     * @param {*} value 
     * @param {*} query 
     * @param {*} operator 
     */
    static matchNumber(value = 0, query = 0, operator = 'eq') {
        switch (operator) {
            case 'gt': return query > value;
            case 'lt': return query < value;
            case 'ge': return query >= value;
            case 'le': return query <= value;
        }
        return value === query;
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
    static readFromProperty(obj, name, partial = false) {
        if (GSUtil.isNull(obj)) return;
        const r = /\[\d+\]$/g;
        const isArray = r.test(name);
        let n = name;
        let i = '';

        if (isArray) {
            n = name.replace(r, '')
            i = name.match(r).shift().match(/\d+/).shift();
            i = GSUtil.asNum(i);
            obj = obj.hasOwnProperty(n) ? obj[n][i] : null;
        } else if (obj.hasOwnProperty(n)) {
            obj = partial ? obj[n] || obj : obj[n];
        } else {
            obj = null;
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
		return name ? name.split('.').reduce((a, v) => GSData.readFromProperty(a, v), obj) : undefined;
	}
	
    /**
     * Check if named path exist within the object
     * @param {Object} obj 
     * @param {String} name 
     * @returns {Boolean}
     */
	static objectPathExist(obj, name) {
        return GSData.readFromObject(obj, name) !== undefined;
	}

    static {
        Object.seal(GSData);
        globalThis.GSData = GSData;
    }
}
