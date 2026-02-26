/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

/**
 * A module loading GSDataListElement class
 * @module components/ext/GSDataListElement
 */

import { OWNER, PARENT } from "../../base/GSConst.mjs";
import { GSID } from "../../base/GSID.mjs";
import { GSDOM } from "../../base/GSDOM.mjs";
import { GSUtil } from "../../base/GSUtil.mjs";
import { GSLoader } from "../../base/GSLoader.mjs";
import { GSEvents } from "../../base/GSEvents.mjs";
import { GSLog } from "../../base/GSLog.mjs";
import { GSAttr } from "../../base/GSAttr.mjs";
import { mixin } from "./EventsMixin.mjs";
import { ControllerHandler } from "./ControllerHandler.mjs";

/**
 * Add JSON loader to datalist element
 * 
 * <datalist is="gs-datalist" data="data.json">
 * 
 * [{text:'', value:'' selected:true}]
 * 
 * @class
 * @extends {HTMLDataListElement}
 */
export class GSExtDataListElement extends HTMLDataListElement {

    static {
        mixin(GSExtDataListElement);
        GSDOM.define('gs-ext-datalist', GSExtDataListElement, { extends: 'datalist' });
        Object.seal(GSExtDataListElement);
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
        GSID.setIf(me);
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
        if (me.autofocus) me.focus();
        const data = me.form?.data;
        if (data) GSDOM.fromObject2Element(me, data);
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
        return this[OWNER]();
    }

    get parentComponent() {
        return this[PARENT]();
    }    

    get asJSON() {
        return this.query('option').forEach(el => GSDOM.fromElement2Object(el, {}));
    }

    set asJSON(data) {
        this.apply(data);
    }

    get storage() {
        return GSAttr.get(this, 'storage');
    }

    /**
     * Storage records key to use to generate unique list
     */
    get key() {
        return GSAttr.get(this, 'key', 0);
    }   

    /**
     * For DataController read callback
     * Convert record data to html JSON format 
     * 
     * @param {Array} data 
     */
    onDataRead(data = []) {
        const me = this;
        const key = me.key;
        data = Array.isArray(data) ? data : [data];
        data = data.map(o => GSUtil.isString(o) ? o : o[key])
            .filter(v => v)
            .map(v => {return {value: v}});
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

        if (GSUtil.isString(o)) o = { value: o };

        Object.entries(o).forEach(it => {
            const key = it[0];
            const val = it[1];
            if ('text' === key) return;
            if ('selected' === key) return seg.push(key);
            seg.push(`${key}="${val}"`);
        });

        if (o.text) {
            seg.push('>')
            seg.push(o.text);
            seg.push('</option>')
        } else {
            seg.push('>')
        }

        return seg.join(' ');
    }

}

