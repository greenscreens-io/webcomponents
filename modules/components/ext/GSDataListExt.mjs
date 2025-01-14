/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSDataListExt class
 * @module components/ext/GSDataListExt
 */


import { GSID } from "../../base/GSID.mjs";
import { GSDOM } from "../../base/GSDOM.mjs";
import { GSUtil } from "../../base/GSUtil.mjs";
import { GSLoader } from "../../base/GSLoader.mjs";

/**
 * Add JSON loader to datalist element
 * 
 * <datalist is="gs-ext-datalist" data="data.json">
 * 
 * [{text:'', value:'' selected:true}]
 * 
 * @class
 * @extends {HTMLDataListElement}
 */
export class GSDataListExt extends HTMLDataListElement {

    static {
        customElements.define('gs-ext-datalist', GSDataListExt, { extends: 'datalist' });
        Object.seal(GSDataListExt);
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        //GSLog.error(null, e);`name:${name}, oldValue:${oldValue}, newValue:${newValue}`);
        if (name === 'data') this.load(newValue);
    }

    connectedCallback() {
        GSID.setIf(this);
    }

    get owner() {
        const own = GSDOM.root(this);
        return GSDOM.unwrap(own);
    }

    async load(url = '') {
        if (!url) return;
        const data = await GSLoader.loadSafe(url, 'GET', null, true);
        this.apply(data);
    }

    apply(data) {

        if (!Array.isArray(data)) return false;

        const me = this;

        queueMicrotask(() => {

            const list = [];
            data.forEach(o => {
                list.push(me.#objToHTML(o));
            });

            GSDOM.setHTML(me, list.join('\n'));
        });
        return true;
    }

    #objToHTML(o) {
        const seg = ['<option'];

        if (GSUtil.isString(o)) o = { value: o };

        Object.entries(o).forEach(it => {
            const key = it[0];
            const val = it[1];
            if ('text' === key) return;
            if ('selected' === key) return seg.push(key);
            seg.push(`${key}="${val}"`);
        });

        seg.push(o.text);
        seg.push('>')

        return seg.join(' ');
    }

}

