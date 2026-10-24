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
import GSUtil from "../../base/GSUtil.mjs";

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
        //GSLog.error(null, `name:${name}, oldValue:${oldValue}, newValue:${newValue}`);
        if (name === 'data') this.load(newValue);
    }

    connectedCallback() {
        const me = this;
        GSID.setIf(me);
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
            me.replaceChildren(...data.map(o => me.#objToOption(o)));
        });
        return true;
    }

    #objToOption(data) {
        const item = GSUtil.isString(data) ? { value: data, text: data } : data;
        const option = document.createElement('option');

        Object.entries(item).forEach(([key, value]) => {
            if (key === 'text') {
                option.textContent = value == null ? '' : String(value);
            } else if (key === 'selected') {
                option.selected = GSUtil.asBool(value);
            } else if (!key.toLowerCase().startsWith('on')) {
                option.setAttribute(key, value);
            }
        });

        return option;
    }

    reset() {
        GSDOM.resetSelect(this);
    }    
}
