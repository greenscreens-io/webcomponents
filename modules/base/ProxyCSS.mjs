/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSDOM from "./GSDOM.mjs";

/**
 * Proxy class to habndle chained css.
 * See ProxyElement class
 */
export default class ProxyCSS {

    #map = null;

    constructor(element) {
        if (!GSDOM.isHTMLElement(element)) throw new Error('Only HTMLElement type allowed!');
        this.#map = new GSCSSMap(element);
    }

    get(object, property, receiver) {
        return (value, dft) => {
            if (!value) return this.#map.get(property);
            if (typeof this.#map[property] === 'function') {
                return this.#map[property](value, dft);
            }
            object[property] = value;
            return receiver;
        }
    }

    static wrap(element) {        
        return new Proxy(element.style, new ProxyCSS(element));
    }
}