/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSFormExt class
 * @module components/ext/GSFormExt
 */

import GSID from "../../base/GSID.mjs";
import GSDOMObserver from '../../base/GSDOMObserver.mjs';
import GSEvents from "../../base/GSEvents.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSData from "../../base/GSData.mjs";
import GSLog from "../../base/GSLog.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSReadWriteRegistry from "../../base/GSReadWriteRegistry.mjs";
import GSUtil from "../../base/GSUtil.mjs";


/**
 * Add custom form processing to support forms in modal dialogs
 * <form is="gs-ext-form">
 * @class
 * @extends {HTMLFormElement}
 */
export default class GSFormExt extends HTMLFormElement {

    static {
        customElements.define('gs-ext-form', GSFormExt, { extends: 'form' });
        Object.seal(GSFormExt);
        GSDOMObserver.registerFilter(GSFormExt.#onMonitorFilter, GSFormExt.#onMonitorResult);
    }

    static #onMonitorFilter(el) {
        if (GSUtil.asBool(el.dataset?.gsIgnore)) return false;
        return el instanceof HTMLFormElement && (el instanceof GSFormExt) === false;
    }

    static #onMonitorResult(el) {
        const form = document.createElement('form', { is: 'gs-ext-form' });
        GSAttr.set(form, 'is', 'gs-ext-form');
        Array.from(el.attributes).forEach(v => GSAttr.set(form, v.name, v.value));
        Array.from(el?.childNodes || []).forEach(child => GSDOM.appendChild(form, child));
        GSDOM.insertAdjacent(el, form, 'afterend');
        GSDOM.removeElement(el);
    }

    static observeAttributes(attributes) {
        return GSData.mergeArrays(attributes, GSFormExt.observedAttributes);
    }

    /**
     * List of observable element attributes
     * @returns {Array<string>} Monitored attributes orientation|id
     */
    static get observedAttributes() {
        return ['storage'];
    }

    #last;
    #controller;
    #reader;

    constructor() {
        super();
        this.#reader = this.#onRead.bind(this);       
    }

    connectedCallback() {
        const me = this;
        GSID.setIf(me);
        me.#attachEvents(me);
        GSEvents.sendSuspended(me, 'form', { type: 'init', data: me }, true, true);
        //GSComponents.store(me);
    }

    disconnectedCallback() {
        const me = this;
        //GSComponents.remove(me);
        GSEvents.deattachListeners(me);
        me.#controller?.abort();
        me.#controller = null;
        me.#last = null;
        me.#reader = null;
    }

    /**
     * Called when element attribute changed
     *  
     * @param {string} name  Attribute name
     * @param {string} oldValue Old value before change
     * @param {string} newValue New value after change
     */
    attributeChangedCallback(name, oldValue, newValue) {
        const me = this;
        requestAnimationFrame(() => me.attributeCallback(name, oldValue, newValue));
    }

    attributeCallback(name, oldValue, newValue) {
        const me = this;
        if (name === 'storage') return me.#onStorage(oldValue, newValue);
    }

    disable() {
        GSDOM.disableInput(this, 'input, textarea, select, .btn', false, 'gsForm');
    }

    enable() {
        GSDOM.enableInput(this, 'input, textarea, select, .btn', false, 'gsForm');
    }

    reset() {
        super.reset();
        this.read();
    }

    submit() {
        return this.#onSubmit();
    }

    onError(e) {
        GSLog.error(this, e);
    }

    /**
     * Overide native to pickup all form elements, including ones in shadow dom
     */
    get elements() {
        return GSDOM.queryAll(this, 'input,select,output,textarea');
    }

    get storage() {
        return GSAttr.get(this, 'storage', '');
    }

    set storage(val = '') {
        GSAttr.set(this, 'storage', val);
    }

    set data(data) {
        const me = this;
        me.#last = data;
        GSDOM.fromObject(me, data);
        const isValid = me.checkValidity() && me.isValid;
        if (!isValid) me.reportValidity();
        return isValid;
    }

    get data() {
        return GSDOM.toObject(this);
    }

    get #handler() {
        return GSReadWriteRegistry.find(this.storage);
    }

    async #onStorage(oldValue, newValue) {
        if (newValue == oldValue) return;
        const me = this;
        me.#controller?.abort();
        const old = GSReadWriteRegistry.find(oldValue);
        GSEvents.remove(me, old, 'read', me.#reader);
        if (!newValue) return;
        me.#controller = new AbortController();
        await GSReadWriteRegistry.wait(newValue, me.#controller.signal);
        GSEvents.attach(me, me.#handler, 'read', me.#reader);
        me.read();
    }

    async read() {
        const me = this;
        //me.data = 
        await me.#handler?.read(me);
    }

    async write() {
        const me = this;
        me.#handler?.write(me, me.data);
    }

    #attachEvents(me) {
        me.action = '#';
        GSEvents.attach(me, me, 'submit', me.#onSubmit.bind(me));
        GSEvents.attach(me, me, 'reset', me.read.bind(me));
        GSEvents.attach(me, me, 'form-field', me.#onField.bind(me));
    }

    #onField(e) {
        const me = this;
        const el = e.detail;
        if (el && me.#last?.hasOwnProperty(el.name)) {
            GSDOM.fromValue(el, me.#last[el.name]);
        }
    }

    #onRead(e) {
        if (e.detail.data) this.data = e.detail.data;
    }

    /**
     * Trigger form submit only if form data is valid
     * @param {Event} e 
     * @returns {boolean} validity status
     */
    #onSubmit(e) {
        GSEvents.prevent(e, true);
        const me = this;
        const isValid = me.checkValidity() && me.isValid;
        if (!isValid) me.reportValidity();
        if (isValid) me.write();
        const data = { type: 'submit', data: me.data, source: e, valid: isValid };
        GSEvents.send(me, 'form', data, true, true);
        return isValid;
    }

    get isValid() {
        return GSDOM.queryAll(this, 'input,select,textarea')
            .filter(el => GSDOM.isVisible(el))
            .map(el => el.checkValidity())
            .filter(v => v === false).length === 0;
    }

}
