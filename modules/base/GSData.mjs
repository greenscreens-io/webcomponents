/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSData class
 * @module base/GSData
 */

import GSUtil from "./GSUtil.mjs";

/**
 * A set of static functions used for loading resources
 * @class
 */
export default class GSData {

    /**
     * Removes duplicates from list
     * @param {Array} data 
     * @returns {Array}
     */
    static uniqe(data) {
        return Array.from(new Set(data));
    }

    /**
     * Check if two arrays are equal
     * 
     * @param {*} a 
     * @param {*} b 
     * @returns {boolean}
     */
    static arraysEqual(a, b) {

        if (a === b) return true;
        if (!Array.isArray(a)) return false;
        if (!Array.isArray(b)) return false;

        a.sort();
        b.sort();

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }

        return true;
    }

    /**
     * Simple array merge, without duplicates. Used by observableAttributes
     * @param {Array} first 
     * @param {Array} second 
     * @returns {Array}
     */
    static mergeArrays(first = [], second = []) {
        return first.concat(second).filter((value, index, arr) => arr.indexOf(value) === index);
    }

    /**
     * Filter array of records 
     * @param {Array<object>|String} filter Check filterComplex function for details
     * @param {Array} data Array of JSON objects or array of array of primitive types
     * @param {Array<String>} fields List of Object properties to check, if not set, all are checked
     * @returns 
     */
    static filterData(filter, data, fields) {
        const me = this;
        data = Array.isArray(data) ? data : [];
        return filter.length === 0 ? data : data.filter(rec => GSData.filterRecord(rec, filter, fields));
    }

    /**
     * Filter single record to a matchign critheria
     * @param {Array<object>|String} filter Check filterComplex function for details
     * @param {Array} data Array of JSON objects or array of array of primitive types
     * @param {Array<String>} fields List of Object properties to check, if not set, all are checked
     * @returns 
     */    
    static filterRecord(rec, filter, fields) {
        const me = this;
        const isSimple = typeof filter === 'string';
        return isSimple ? GSData.filterSimple(rec, filter, fields) : GSData.filterComplex(rec, filter);
    }

    /**
     * Check if JSON object contains a value in any of defined properties
     * @param {Object} rec Json object to check
     * @param {string} filter Value to search for
     * @param {Array<string>} fields List of proerties to serach
     * @returns {boolean} Retuen true if any of given properties (or all) contains provided value
     */
    static filterSimple(rec, filter = '', fields) {
        filter = filter.toLowerCase();
        fields = fields || Object.keys(rec);
        let value = null;
        for (let key of fields) {
            value = rec[key];
            if (('' + value).toString().toLowerCase().includes(filter)) return true;
        }
        return false;
    }

    /**
     * Check if object contains data in selected properities
     * @todo Add support for eq,gt,lt,like,or operators
     * @param {Object|Array} rec Json object or array of primitive values to check
     * @param {Array<Object>} filter List of filter objects in format
     *        [{name: idx[num] || name[string], value: ''  , op:'eq'}]
     *        Where:
     *           - name is numeric index only if rec is array of primitive values ([1,'a','b',4]...etc)
     *           - name is string if rec is JSON object
     * @returns {boolean} Flag indicating if record is matched to a given filter critheria
     */
    static filterComplex(rec, filter) {

        let found = true;
        let match = null;

        for (let flt of filter) {
            match = flt?.value?.toString().toLowerCase();
            found = found && ('' + rec[flt.name]).toLocaleLowerCase().includes(match);
            if (!found) break;
        }

        return found;
    }

    /**
     * 
     * @param {*} sort 
     * @param {*} data 
     * @returns 
     */
    static sortData(sort, data) {
        if (sort.length === 0) return data;
        return data.sort((a, b) => GSData.sortPair(a, b, sort));
    }

    /**
     * Sort two values, recursion supported
     * @param {*} v1 Array of primitive types or JSON object
     * @param {*} v2 Array of primitive types or JSON object
     * @param {number} sort -1 | 0 | 1 (descending, as id, ascending )
     * @returns {number} -1 | 0 | 1
     */
    static sortPair(a, b, sort) {
        const me = this;
        const isArray = Array.isArray(a);
        let sts = 0;

        sort.forEach((o, i) => {
            if (!o) return;
            const idx = o.col || i;
            const key = isArray ? idx : o.name;
            const v1 = a[key];
            const v2 = b[key];

            sts = GSData.compare(v1, v2, o.ord, sts);
        });

        return sts;
    }

    /**
     * Compare two values, recursion supported
     * @param {*} v1 
     * @param {*} v2 
     * @param {number} order -1 | 0 | 1 (descending, as id, ascending )
     * @param {number} sts previous value
     * @returns {number} -1 | 0 | 1
     */
    static compare(v1, v2, order, sts) {
        const me = this;
        if (GSUtil.isNumber(v1) && GSUtil.isNumber(v2)) {
            return sts || GSData.compareNum(v1, v2, order);
        } else if (GSUtil.isString(v1) || GSUtil.isString(v2)) {
            return sts || GSData.compareString(v1, v2, order);
        } else if(GSUtil.isBool(v1) || GSUtil.isBool(v2)) {
            return sts || GSData.compareBool(v1, v2, order);
        }
        return sts;
    }

    /**
     * Safely compare two boolean values
     * @param {boolean} v1 
     * @param {boolean} v2 
     * @param {number} ord 
     * @returns 
     */
    static compareBool(v1, v2, ord) {
        v1 = v1 ? 1 : 0;
        v2 = v2 ? 1 : 0;
        return GSData.compareNum(v1, v2, ord);
    }

    /**
     * Compare two string values 
     * @param {string} v1 
     * @param {string} v2 
     * @param {number} ord 
     * @returns {number} -1, 1, 0
     */
    static compareString(v1, v2, ord) {
        const s1 = (v1 || '').toString();
        const s2 = (v2 || '').toString();
        return ord < 0 ? s2.localeCompare(s1) : s1.localeCompare(s2);
    }

    /**
     * Compare two numeric values
     * @param {number} v1 
     * @param {number} v2 
     * @param {number} ord positive = ascending, negative - descending 
     * @returns {number} < 0 or 1 or > 0
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
	 * @param {*} value 
	 */
	static writeToOject(obj, name, value, ignoreNull = true) {
        if (ignoreNull && GSUtil.isNull(value)) return;
        
        const seg = name.split('.');
        if (seg.length === 1) {
            return GSData.#writeSingleToOject(obj, name, value);
        }
        
        const tree = seg.slice(0, -1);
        const key = seg.slice(-1)[0];
        
        tree.forEach( v => {
            if(!obj.hasOwnProperty(v)) obj[v] = {};
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
     * @param {string} name 
     * @returns 
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
		name.split('.').forEach((v, i, a) => {
            if (GSUtil.isNull(o)) return;
			obj = GSData.readFromProperty(obj, v);
		});
		return obj;
	}
	
    /**
     * Check if named path exist withing object
     * @param {Object} obj 
     * @param {String} name 
     * @returns {Boolean}
     */
	static objectPathExist(obj, name) {
        if (!name) return false;
		name.split('.').forEach(v => {
            if (GSUtil.isNull(o)) return;
            obj = GSData.readFromProperty(obj, v);
		});
		return obj ? true : false;
	}

    static {
        Object.seal(GSData);
        globalThis.GSData = GSData;
    }
}
