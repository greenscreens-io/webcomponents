/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSUtil } from "../base/GSUtil.mjs";

/**
 * A module loading GSAbstractReadWrite class
 * @module base/GSEvent
 */

/**
 * Generic Class for data read/write for various components such as grid/form/dynamic menu etc.
 * @Class
 */
export class DataSelector  {

    static #SELECT = Symbol('select');

    /**
     * Store selected record ID
     * @param {*} val 
     * @returns 
     */
    static addSelected(val) {
        if (!val) return false;

        if (Array.isArray(val)) {
            val[DataSelector.#SELECT] = true;
        } else {
            GSUtil.asArray(val).forEach(o => o[DataSelector.#SELECT] = true);
        }
        return val;
    }

    /**
     * Remove selected record ID
     * @param {*} val 
     */
    static removeSelected(val) {
        if (!val) return false;
        delete val[DataSelector.#SELECT];
        return val;
    }

    /**
     * Remove all selections
     */
    static clearSelected(data) {
        const me = this;
        GSUtil.asArray(data).forEach(o => me.removeSelected(o));
    }

    /**
     * Return list of all selected record id's
     */
    static getSelected(data = []) {
        const me = this;        
        return me.isSelected(data) || GSUtil.asArray(data).filter(o => me.isSelected(o));
    }

    /**
     * Check if record id is in list of selected records
     * @param {*} val 
     * @returns 
     */
    static isSelected(val) {
        return val ? val[DataSelector.#SELECT] === true : false;
    }

}