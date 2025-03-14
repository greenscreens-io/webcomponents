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
import { GSEvents } from "../../base/GSEvents.mjs";
import { GSLog } from "../../base/GSLog.mjs";
import { GSAttr } from "../../base/GSAttr.mjs";
import { DataController } from "../../controllers/DataController.mjs";
import { GSData } from "../../base/GSData.mjs";

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

    #data = [];
    #isConnected = false;
    #controllers = undefined;
    #dataController = undefined;

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        //GSLog.error(null, e);`name:${name}, oldValue:${oldValue}, newValue:${newValue}`);
        if (name === 'data') this.load(newValue);
        this.#controllers?.forEach((c) => c.hostUpdated?.());
    }

    connectedCallback() {
        const me = this;
        GSID.setIf(me);
        if (me.storage) me.#dataController ??= new DataController(me);
        me.#controllers?.forEach((c) => c.hostConnected?.());
        me.#isConnected = true;
    }

    disconnectedCallback() {
        const me = this;
        me.#isConnected = false;
        me.#controllers?.forEach((c) => c.hostDisconnected?.());        
        GSEvents.detachListeners(me);
    }
   
    addController(controller) {
        const me = this;
        (me.#controllers ??= new Set()).add(controller);
        if (me.#isConnected) {
            controller.hostConnected?.();
        }
    }

    removeController(controller) {
        this.#controllers?.delete(controller);
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

    /**
     * For DataController read callback
     * 
     * @param {Array} data 
     */
    onDataRead(data = []) {
        const me = this;
        const key = me.key;
        me.#data = GSData.mergeArrays(data.map(o => o[key]), me.#data.map(o => o.value))
               .map(v => {return {value:v}});        
        me.apply(me.#data);
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
}

