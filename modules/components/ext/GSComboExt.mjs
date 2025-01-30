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
import { GSEvents } from "../../base/GSEvents.mjs";

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
        const me = this;
        GSID.setIf(me);
        const data = me.form?.data;
        if (data) GSDOM.fromObject2Element(me, data);
        me.on('reset', me.#onReset);
    }

    disconnectedCallback() {
        GSEvents.deattachListeners(this);
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
     * Get parent GS-* component
     */
    get parentComponent() {
        return GSDOM.parentAll(this).filter(x => x instanceof GSElement).next()?.value;
    }

    reset() {
        GSDOM.resetSelect(this);
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


    /**
     * Generic component signal
     * @param {Boolean} bubbles  Does buuble to upper nodes
     * @param {Boolean} composed Does traverse from shadow DOM 
     */
    notify(bubbles = true, composed = false, data) {
        this.emit('notify', data, bubbles, composed, true);
    }

    /**
     * Send event
     * @param {String} name 
     * @param {Object} obj 
     * @param {Boolean} bubbles 
     * @param {Boolean} composed 
     * @param {Boolean} cancelable 
     */
    emit(name, obj = '', bubbles = false, composed = false, cancelable = false) {
        return GSEvents.send(this, name, obj, bubbles, composed, cancelable);
    }

    /**
     * Wait for event to happen
     * @async
     * @param {String} name 
     * @returns {Promise}
     */
    waitEvent(name = '', timeout = 0) {
        return GSEvents.wait(this, name, timeout);
    }

    /**
     * Listen once for triggered event
     * @param {String} name  A name of the event
     * @param {Function} func A callback function on event trigger
     * @returns {Boolean}
     */
    once(name, func) {
        return this.listen(name, func, true);
    }

    /**
     * Alternative function for event listen
     * @param {String} name  A name of the event
     * @param {Function} func A callback function on event trigger
     * @returns {Boolean}
     */
    on(name, func, once = false) {
        return this.listen(name, func, once);
    }

    /**
     * Alternative function for event unlisten
     * @param {String} name  A name of the event
     * @param {Function} func A callback function on event trigger
     * @returns {Boolean}
     */
    off(name, func) {
        return this.unlisten(name, func);
    }

    /**
     * Prevent event firing up the DOM tree
     * @param {Event} e 
     */
    prevent(e) {
        GSEvents.prevent(e);
    }

    /**
     * Attach event to this element
     * @param {String} name  A name of the event
     * @param {Function} func A callback function on event trigger
     * @returns {Boolean}
     */
    listen(name, func, once = false) {
        return this.attachEvent(this, name, func, once);
    }

    /**
     * Remove event from this element
     * @param {String} name  A name of the event
     * @param {Function} func A callback function on event trigger
     * @returns {Boolean}
     */
    unlisten(name, func) {
        return this.removeEvent(this, name, func);
    }

    /**
    * Generic event listener appender
    * 
    * @param {HTMLElement} el Element on which to monitor for named events
    * @param {String} name Event name to watch for
    * @param {Function} fn Event trigger callback
    * @param {Boolean} once Listen only once
    * @returns {Boolean} State if attachment was successful
    */
    attachEvent(el, name = '', fn, once = false) {
        return GSEvents.attach(this, el, name, fn, once);
    }

    /**
    * Generic event listener remove
    * @param {HTMLElement} el Element on which to monitor for named events
    * @param {String} name Event name to watch for
    * @param {Function} fn Event trigger callback
    * @returns {Boolean} State if attachment was successful	
    */
    removeEvent(el, name = '', fn) {
        return GSEvents.remove(this, el, name, fn);
    }

    #onReset(e) {
        this.reset();
    }
}

