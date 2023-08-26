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
        GSDOMObserver.registerFilter(GSFormExt.#onMonitorFilter, GSFormExt.#onMonitorRemove, true);
    }

    static #onMonitorFilter(el) {
        return el instanceof HTMLFormElement && (el instanceof GSFormExt) === false;
    }

    static #onMonitorResult(el) {
        GSFormExt.#attachEvents(el);
    }

    static #onMonitorRemove(el) {
        GSEvents.deattachListeners(el);
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

    #controller;
    #reader;

    constructor() {
        super();
        this.#reader = this.#onRead.bind(this);
    }

    connectedCallback() {
        const me = this;
        GSID.setIf(me);
        GSFormExt.#attachEvents(me);
        //GSComponents.store(me);
    }

    disconnectedCallback() {
        const me = this;
        //GSComponents.remove(me);
        GSEvents.deattachListeners(me);
        me.#controller?.abort();
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
        return GSFormExt.#onSubmit.bind(this)();
    }

    onError(e) {
        GSLog.error(this, e);
    }

    get storage() {
        return GSAttr.get(this, 'storage', '');
    }

    set storage(val = '') {
        GSAttr.set(this, 'storage', val);
    }

    set data(data) {
        const me = this;
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
        GSEvents.unlisten(me, old, 'read', me.#reader);
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

    #onRead(e) {
        if (e.detail.data) this.data = e.detail.data;
    }

    static #attachEvents(me) {
        me.action = '#';
        GSEvents.attach(me, me, 'submit', GSFormExt.#onSubmit.bind(me));
        GSEvents.attach(me, me, 'reset', me.read.bind(me));
    }

    /**
     * Trigger form submit only if form data is valid
     * @param {Event} e 
     * @returns {boolean} validity status
     */
    static #onSubmit(e) {
        GSEvents.prevent(e);
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

