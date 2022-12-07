/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSUtil from "./GSUtil.mjs";
import GSFunction from "./GSFunction.mjs";

/**
 * A module loading GSCSSMap class
 * @module base/GSCSSMap
 */

/**
 * Wrapper around computesdStyledMap to support Firefox and WebKit Mode
 * @class
 */
export default class GSCSSMap {

    static #modern = globalThis.document?.body?.computedStyleMap ? true : false;

    #map;

    constructor(element) {
        const me = this;
        me.#map = GSCSSMap.#getMap(element);
    }

    get(name) {
        const me = this;
        if (!me.#map) return undefined;
		return  GSCSSMap.#modern ? me.#map.get(name) :  me.#map[GSUtil.capitalizeAttr(name)];
    }

    asText(name) {
        return (this.get(name) || '')?.toString();
    }

    asBool(name) {
        const val = this.get(name);
        return GSUtil.asBool(GSCSSMap.#modern ? val?.value : val);
    }

    asNum(name) {
        let val = this.get(name);
        if (GSCSSMap.#modern && GSFunction.isFunction(val?.to)) {
            if (val.unit !== 'number') val = val.to('px');
        }
        return GSUtil.asNum(GSCSSMap.#modern ? val?.value : val);
    }

    matches(name, value) {
        return this.asText(name) == value;
    }

	/**
	 * Support for Firefox/Gecko to get element computedStyledMap
	 * @param {HTMLElement} el 
	 * @returns {}
	 */
	static #getMap(el) {
		if (GSCSSMap.#modern) return el.computedStyleMap();
		if (globalThis.window?.getComputedStyle) return globalThis.window.getComputedStyle(el);
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

    static {
		Object.seal(GSCSSMap);
		globalThis.GSCSSMap = GSCSSMap;
	}
}