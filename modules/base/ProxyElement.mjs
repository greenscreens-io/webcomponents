/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSDOM from "./GSDOM.mjs";
import ProxyCSS from "./ProxyCSS.mjs";

/**
 * Proxy class for wrapping HTMLElement, allowing to use GS query across shadow dom
 * and css operations for easier property get /set
 * 
 * const el = ProxyElement.wrap(document.body);
 * el.query('div') // query across shadow dom
 * el.css = {width:'100px'} // easier way to set css
 * 
 * // chained css property setup
 * el.css.width('100px').background('red')
 * 
 * // retrieve calculated value
 * console.log(el.css.background)
 * console.log(el.css.asNum('width'))
 */
export default class ProxyElement {

    #css = null;

    constructor(element) {
        this.#css = ProxyCSS.wrap(element);
    }

    get(object, property) {
        if (property === 'css') return this.#css;
        if (property === 'query') {
            return (value, all, shadow) => {
                const el = GSDOM.query(object, value, all, shadow);
                return ProxyElement.wrap(el);
            }
        }
        if (property === 'queryAll') {
            return (value, all, shadow) => {
                const el = GSDOM.queryAll(object, value, all, shadow);
                return ProxyElement.wrap(el);
            }
        }        
        return object[property];
    }

    set(object, property, value) {
        switch (property) {
            case 'css':
                if (Array.isArray(object)) {
                    object.forEach(element => element[property] = value); 
                } else {
                    GSDOM.css(object, value);
                }
                break;
            default:
                object[property] = value;
        }
        return true;
    }

    static instance(node) {
        return new Proxy(node, ProxyElement.wrap(node));
    }

    static wrap(node) {
        if (GSDOM.isHTMLElement(node)) return ProxyElement.instance(node);
        if (!Array.isArray(node)) return node;
        node = node.map(element => ProxyElement.instance(element));
        return ProxyElement.instance(node);
    }    
}