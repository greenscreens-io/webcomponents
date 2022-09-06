/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDataListExt class
 * @module components/ext/GSDataListExt
 */

import GSID from "../../base/GSID.mjs";
import GSComponents from "../../base/GSComponents.mjs";
import GSLoader from "../../base/GSLoader.mjs";
import GSDOM from "../../base/GSDOM.mjs";

/**
 * Add JSON loader to select element
 * <select is="gs-ext-select" data="data.json">
 * 
 * [{text:'', value:'' selected:true}]
 * 
 * @class
 * @extends {HTMLSelectElement}
 */
export default class GSComboExt extends HTMLSelectElement {

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
        //console.log(`name:${name}, oldValue:${oldValue}, newValue:${newValue}`);
        if (name === 'data') this.load(newValue);
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSComponents.store(me);
    }

    disconnectedCallback() {
        GSComponents.remove(this);
    }

    get owner() {
        const own = GSComponents.getOwner(this);
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

        requestAnimationFrame(() => {

            const list = [];
            data.forEach(o => {
                list.push(me.#objToHTML(o));
            });

            me.innerHTML = list.join('\n');
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

