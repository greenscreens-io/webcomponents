/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSDataListExt class
 * @module components/ext/GSDataListExt
 */

import { GSID } from "../../base/GSID.mjs";
import { GSDOM } from "../../base/GSDOM.mjs";
import { GSLoader } from "../../base/GSLoader.mjs";

/**
 * Add JSON loader to select element
 * <select is="gs-ext-select" data="data.json">
 * 
 * [{text:'', value:'' selected:true}]
 * 
 * @class
 * @extends {HTMLSelectElement}
 */
export class GSComboExt extends HTMLSelectElement {

    static {
        customElements.define('gs-ext-select', GSComboExt, { extends: 'select' });
        Object.seal(GSComboExt);
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        //GSLog.error(null, `name:${name}, oldValue:${oldValue}, newValue:${newValue}`);
        if (name === 'data') this.load(newValue);
    }

    connectedCallback() {
        GSID.setIf(this);
        const data = this.form?.data;
        if (data) GSDOM.fromObject2Element(this, data);
    }

    validate() {
        const me = this;
        const isValid = me.checkValidity();
        if (!isValid) me.reportValidity();
        return isValid;
    }

    get form() {
        return this.closest('gs-form');
    }

    get owner() {
        const own = GSDOM.root(this);
        return GSDOM.unwrap(own);
    }

    /**
     * Find closest top element by CSS selector
     * @param {String} query 
     * @returns {HTMLElement}
     */
    closest(query = '') {
        return GSDOM.closest(this, query);
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

        Object.entries(o).forEach(it => {
            const key = it[0];
            const val = it[1];
            if ('text' === key) return;
            if ('selected' === key) return seg.push(key);
            seg.push(`${key}="${val}"`);
        });

        seg.push('>')
        seg.push(o.text);
        seg.push('</option>')

        return seg.join(' ');
    }

}

