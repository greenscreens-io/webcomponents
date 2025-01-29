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
import { GSEvent } from "../../base/GSEvent.mjs";
import { GSEvents } from "../../base/GSEvents.mjs";
import { GSAttr } from "../../base/GSAttr.mjs";
import { GSBeep } from "../../base/GSBeep.mjs";

/**
 * Add JSON loader to select element
 * <textarea is="gs-ext-text"></textarea>
 * 
 * [{text:'', value:'' selected:true}]
 * 
 * @class
 * @extends {HTMLTextAreaElement}
 */
export class GSTextArea extends HTMLTextAreaElement {

    static {
        customElements.define('gs-ext-text', GSTextArea, { extends: 'textarea' });
        Object.seal(GSTextArea);
    }

    #processing;

    constructor() {
        super();
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        GSID.setIf(this);
        GSEvent
        this.on('invalid', this.#onInvalid);
        this.on('change', this.#onChange);
        const data = this.form?.data;
        if (data) GSDOM.fromObject2Element(this, data);
    }

    disconnectedCallback() {
        GSEvents.deattachListeners(this);
        super.disconnectedCallback();
    }

    #onChange() {
        const me = this;
        me.setCustomValidity('');
        const isValid = me.checkValidity();
        if (!isValid) me.reportValidity();
        return isValid;
    }

    async #onInvalid(e) {

        const me = this;
        if (me.#processing) return;

        me.#processing = true;
        if (me.block) me.focus();
        if (me.beep) await GSBeep.beep(100, 1200, 150, 'triangle');
        if (me.timeout) {
            await GSUtil.timeout(me.timeout);
            me.setCustomValidity(' ');
        }
        me.#processing = false;
    }

    get block() {
        return this.hasAttribute('block');
    }

    get beep() {
        return this.hasAttribute('beep');
    }

    get timeout() {
        return GSAttr.getAsNum(this, 'timeout', 0);
    }

    set block(val = false) {
        GSAttr.toggle(this, 'block', val);
    }

    set beep(val = false) {        
        GSAttr.toggle(this, 'beep', val);
    }

    set timeout(val = 0) {
        return GSAttr.setAsNum(this, 'timeout', val);
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
        this.value = await GSLoader.loadSafe(url, 'GET', null, true);
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

}

