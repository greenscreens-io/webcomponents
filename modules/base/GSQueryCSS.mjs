/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSDOM from "./GSDOM.mjs";
import GSFunction from "./GSFunction.mjs";
import GSUtil from "./GSUtil.mjs";

/**
 * Proxy class to handle chained css.
 * Used internally, see GSQuery class.
 */
export default class GSQueryCSS {

    #map = null;

    constructor(element) {
        if (!GSDOM.isHTMLElement(element)) throw new Error('Only HTMLElement type allowed!');
        this.#map = new GSCSSMap(element);
    }

    #isFunc(property) {
        return GSFunction.hasFunction(this.#map, property);
    }

    get(object, property, receiver) {
        return (value, dft) => {
            const me = this;
            if (GSUtil.isNull(value)) return me.#map.get(property);
            if (me.#isFunc(property)) return me.#map[property](value, dft);
            object[property] = value;
            return receiver;
        }
    }

    static wrap(element) {        
        return new Proxy(element.style, new GSQueryCSS(element));
    }
}
