/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSDOM from "./GSDOM.mjs";
import GSQueryCSS from "./GSQueryCSS.mjs";

/**
 * Proxy class for wrapping HTMLElement, allowing to use GS query across shadow dom
 * and css operations for easier property get /set
 * 
 * const el = GSQuery.wrap(document.body);
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
export default class GSQuery {

    #css = null;

    constructor(element) {
        if (!Array.isArray(element)) this.#css = GSQueryCSS.wrap(element);
    }

    get(object, property) {
        if (property === 'css') return this.#css;
        if (property === 'query') {
            return (value, all, shadow) => {
                const el = GSDOM.query(object, value, all, shadow);
                return GSQuery.wrap(el);
            }
        }
        if (property === 'queryAll') {
            return (value, all, shadow) => {
                const el = GSDOM.queryAll(object, value, all, shadow);
                return GSQuery.wrap(el);
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
        return new Proxy(node, new GSQuery(node));
    }

    static wrap(node) {
        if (GSDOM.isHTMLElement(node)) return GSQuery.instance(node);
        if (!Array.isArray(node)) return node;
        node = node.map(element => GSQuery.wrap(element));
        return GSQuery.instance(node);
    }
    
    static all(own, qry, all, shadow) {
        return GSQuery.wrap(GSDOM.queryAll(own, qry, all, shadow));
    }

    static first(own, qry, all, shadow) {
        return GSQuery.wrap(GSDOM.query(own, qry, all, shadow));
    }

    static {
        Object.freeze(GSQuery);
        globalThis.GSQuery = GSQuery;
    }    
}