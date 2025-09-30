/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSDataListExt class
 * @module components/ext/GSDataListExt
 */

import { GSDOM } from "../../base/GSDOM.mjs";
import { GSLoader } from "../../base/GSLoader.mjs";
import { GSEvents } from "../../base/GSEvents.mjs";
import { GSAttr } from "../../base/GSAttr.mjs";
import { GSUtil } from "../../base/GSUtil.mjs";
import { mixin } from "./EventsMixin.mjs";
import { GSLog } from "../../base/GSLog.mjs";
import { ControllerHandler } from "./ControllerHandler.mjs";

/**
 * Add JSON loader to select element
 * <select is="gs-ext-select" data="data.json">
 * 
 * [{text:'', value:'' selected:true}]
 * 
 * @class
 * @extends {HTMLSelectElement}
 */
export class GSExtSelectElement extends HTMLSelectElement {

    static {
        mixin(GSExtSelectElement);
        GSDOM.define('gs-ext-select', GSExtSelectElement, { extends: 'select' });
        Object.seal(GSExtSelectElement);
    }

    #data = [];

    #controllerHandler = undefined;
    #hasUpdated = false;

    constructor() {
        super();
        this.#controllerHandler = new ControllerHandler(this);
    }

    static get observedAttributes() {
        return ['url'];
    }

    connectedCallback() {
        const me = this;
        me.#controllerHandler?.connectedCallback();
        me.#preupdate();
    }

    disconnectedCallback() {
        const me = this;
        me.#controllerHandler?.disconnectedCallback();
        me.#controllerHandler = undefined;
        GSEvents.detachListeners(me);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const me = this;
        me.#preupdate(name);
        me.willUpdate(name, oldValue, newValue);
        me.#controllerHandler?.hostUpdated(name);
    }

    #preupdate(name) {
        const me = this;
        if (!me.#hasUpdated) {
            me.firstUpdated(name);
            me.#controllerHandler?.hostUpdated(name);
            me.#hasUpdated = true;
        }
    }

    firstUpdated(changed) {
        const me = this;
        const data = me.form?.data;
        if (data) GSDOM.fromObject2Element(me, data);
        if (me.autofocus) me.focus();
        me.on('reset', me.#onReset);
    }

    willUpdate(changed, oldValue, newValue) {

        if (changed === 'url') this.load(newValue);
        if (changed === 'required' || changed === 'disabled') {
            this.validate();
        }
    }

    addController(controller) {
        this.#controllerHandler?.addController(controller);
    }

    removeController(controller) {
        this.#controllerHandler?.removeController(controller);
    }

    get owner() {
        return this[Symbol.for('gs-owner')]();
    }

    get parentComponent() {
        return this[Symbol.for('gs-parent')]();
    }    

    get asJSON() {
        return this.query('option').forEach(el => GSDOM.fromElement2Object(el, {}));
    }

    set asJSON(data) {
        this.apply(data);
    }

    /**
     * Storage records key to use to generate unique list
     */
    get key() {
        return GSAttr.get(this, 'key', 0);
    }

    get storage() {
        return GSAttr.get(this, 'storage');
    }

    get form() {
        const me = this;
        return super.form || me.owner?.form || me.closest?.('form');
    }

    /**
     * Support for multiple selections
     */
    get values() {
        return Array.from(this.selectedOptions).map(el => el.value);
    }

    /**
     * String array ov values to match for selection
     */
    set values(values) {
        values ??= [];
        if (GSUtil.isString(values)) values = values.split(',');
        Array.from(el.options).forEach(el => el.selected = values.indexOf(el.value) > -1);
    }

    checkValidity() {
        this.validate();
        return super.checkValidity();
    }

    reportValidity() {
        this.validate();
        return super.reportValidity();
    }

    validate(e) {
        return this.#controllerHandler.validate(e);
    }

    reset() {
        GSDOM.resetSelect(this);
    }
        
    /**
     * For DataController read callback
     * Convert record data to html JSON format 
     * @param {Array} data 
     */
    onDataRead(data = []) {
        const me = this;
        const key = me.key;
        data = Array.isArray(data) ? data : [data];
        data = data.map(o => GSUtil.isString(o) ? o : o[key])
            .filter(v => v)
            .map(v => {return {text: v, value: v}});
        me.apply(data);
    }

    /**
     * Load html definition in JSON format
     * @param {string} url 
     * @returns 
     */
    async load(url = '') {
        if (!url) return;
        try {
            const data = await GSLoader.loadSafe(url, 'GET', null, true);
            this.apply(data);
        } catch (error) {
            console.error('Failed to load data:', error);
            GSLog.error(this, error);
        }
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

    #onReset(e) {
        this.reset();
    }

}

