/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSUtil } from "../base/GSUtil.mjs";

export class ButtonTypes {

    static values = ['button', 'reset', 'submit'];

    static is(val) {
        return ButtonTypes.values.includes(val);
    }

    static isReset(val) {
        return  ButtonTypes.isType(val, 'reset');
    }

    static isSubmit(val) {
        return  ButtonTypes.isType(val, 'submit');
    }

    /**
     * Check button type, by spec, if not set, default is 'submit'
     * @param {*} type - button type
     * @param {*} value - matching value
     * @returns 
     */
    static isType(type, value) {
        return ButtonTypes.#normalize(type) === value;
    }

    static #normalize(type) {
        return GSUtil.normalize(type, 'submit').toLowerCase();
    }
} 

export const buttonType = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && ButtonTypes.is(newVal);
    }

};