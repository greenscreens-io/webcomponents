/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSUtil from "./GSUtil.mjs";

/**
 * A module loading GSCSSMap class
 * @module base/GSCSSMap
 */

/**
 * Wrapper around computesdStyledMap to support Firefox and WebKit Mode
 * @class
 */
export default class GSCSSMap {

    #map;

    constructor(element) {
        const me = this;
        me.#map = GSCSSMap.#getMap(element);
    }

    get(name) {
        const me = this;
        if (!me.#map) return undefined;
		const css =  (typeof me.#map.get === 'function') ? me.#map.get(name) :  me.#map[GSUtil.capitalizeAttr(name)];
		return css?.hasOwnProperty('value') ? css.name : css;
    }

    asBool(name) {
        return GSUtil.asBool(this.get(name));
    }

    asNum(name) {
        return GSUtil.asNum(this.get(name));
    }

    matches(name, value) {
        return this.get(name) == value;
    }

	/**
	 * Support for Firefox/Gecko to get element computedStyledMap
	 * @param {HTMLElement} el 
	 * @returns {}
	 */
	static #getMap(el) {
		if (el.computedStyleMap) return el.computedStyleMap();
		if (window.getComputedStyle) return window.getComputedStyle(el);
		return null;
	}

	/**
	 * Support for Firefox/Gecko to get element computedStyledMap item
	 * @param {HTMLElement} el 
	 * @returns {}
	 */
     static styleValue(el, name) {
		return GSCSSMap.getComputedStyledMap(el).get(name);
	}

    /**
     * Support for Firefox/Gecko to get element computedStyledMap
     * @param {HTMLElement} element 
     * @returns {}
     */
    static getComputedStyledMap(element) {
        return new GSCSSMap(element);
    }
}