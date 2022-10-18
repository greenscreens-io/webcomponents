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

    static filterData(filter, data, fields) {
        const me = this;
        return filter.length === 0 ? data : data.filter(rec => GSData.filterRecord(rec, filter, fields));
    }

    static filterRecord(rec, filter, fields) {
        const me = this;
        const isSimple = typeof filter === 'string';
        return isSimple ? GSData.filterSimple(rec, filter, fields) : GSData.filterComplex(rec, filter);
    }

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

    static filterComplex(rec, filter) {
        let found = true;
        let match = null;

        for (let flt of filter) {
            
            match = flt?.value?.toLowerCase();
            found = found && ('' + rec[flt.name]).toLocaleLowerCase().includes(match);
            if (!found) break;
        }

        return found;
    }

    static sortData(sort, data) {
        if (sort.length === 0) return data;
        return data.sort((a, b) => GSData.sortPair(a, b, sort));
    }

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

    static compare(v1, v2, order, sts) {
        const me = this;
        if (GSUtil.isNumber(v1) && GSUtil.isNumber(v2)) {
            return sts || GSData.compareNum(v1, v2, order);
        } else if (GSUtil.isString(v1) || GSUtil.isString(v2)) {
            return sts || GSData.compareString(v1, v2, order);
        }
        return sts;
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
     * @returns {number} -1 or 1 or 0
     */
    static compareNum(v1, v2, ord) {
        return ord < 0 ? v2 - v1 : v1 - v2;
    }

    static {
        Object.seal(GSData);
    }
}
