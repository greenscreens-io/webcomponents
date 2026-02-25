/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSDataListExt class
 * @module components/ext/GSDataListExt
 */

import { GSDOM } from "../../base/GSDOM.mjs";
import { GSEvents } from "../../base/GSEvents.mjs";
import { GSAttr } from "../../base/GSAttr.mjs";
import { ControllerHandler } from "./ControllerHandler.mjs";
import { mixin } from './EventsMixin.mjs';
import { GSLog } from "../../base/GSLog.mjs";
import { GSLoader } from "../../base/GSLoader.mjs";
import { GSUtil } from "../../base/GSUtil.mjs";

const HANDLER_KEY = Symbol.for('gs-handler');

/**
 * Extended native forn with additional functionality
 * 
 * @class
 * @extends { HTMLFormElement }
 */
export class GSExtFormElement extends HTMLFormElement {

    static {
        mixin(GSExtFormElement);
        GSDOM.define('gs-ext-form', GSExtFormElement, { extends: 'form' });
        Object.seal(GSExtFormElement);
    }

    static get observedAttributes() {
        return ['url', 'disabled'];
    }

    #hasUpdated = false;

    onvalid = undefined;
    
    constructor() {
        super();
        this[HANDLER_KEY] = new ControllerHandler(this);
    }

    connectedCallback() {
        const me = this;
        me.#controllerHandler?.connectedCallback?.();
        me.#preupdate();
    }

    disconnectedCallback() {
        const me = this;
        me.#controllerHandler?.disconnectedCallback?.();
        me[HANDLER_KEY] = undefined;
        GSEvents.detachListeners(me);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const me = this;
        me.#preupdate(name);
        me.willUpdate(name, oldValue, newValue);
        me.#controllerHandler?.hostUpdated?.(name);
    }

    #preupdate(name) {
        const me = this;
        if (!me.#hasUpdated) {
            me.firstUpdated(name);
            me.#controllerHandler?.hostUpdated?.(name);
            me.#hasUpdated = true;
        }
    }

    firstUpdated(changed) {
        const me = this;
        const data = me.formComponent?.data;
        if (data) GSDOM.fromObject2Element(me, data);
        if (me.autofocus) me.focus();
    }

    willUpdate(changed, oldValue, newValue) {
        const me = this;
        if (changed === 'url') me.load(newValue);
        if (changed === 'disabled') {
            me.disabled ? me.disable() : me.enable();
        }
    }

    addController(controller) {
        this.#controllerHandler?.addController(controller);
    }

    removeController(controller) {
        this.#controllerHandler?.removeController(controller);
    }

    reset() {
        const me = this;
        // reset shadowed
        me.inputs
        .filter(el => GSDOM.isShadowed(el))
        .forEach(el => GSDOM.reset(el));
        // reset non shadowed
        super.reset();        
    }

    /**
     * Check validity of the form and each individual field, 
     * return true only if all valid.
     * Trigger 'invalid' event on invalid fields.
     * 
     * @returns {Boolean} Returns true if form is valid
     */
    checkValidity() {
        return super.checkValidity() &&
                this.inputs
                .filter(el => !el.disabled)
                .every(el => el.checkValidity());
    }

    /**
     * The same as checkValidity, but also shows validation messages
     * @returns {Boolean} Returns true if form is valid
     */
    reportValidity() {
        return super.reportValidity() &&
                this.inputs
                .filter(el => !el.disabled)
                .every(el => el.reportValidity());
    }

    /**
     * Find field by name
     * @param {*} name 
     * @returns 
     */
    field(name) {
        return name && this.inputs.filter(f => f.name === name);
    }

    disable() {
        const me = this;
        GSDOM.disableInput(me);
        me.emit("disabled");        
    }

    enable() {
        const me = this;
        GSDOM.enableInput(me);
        me.emit("enabled");
    }

    async load(url = '') {
        if (!url) return;
        try {
            const data = await GSLoader.loadSafe(url, 'GET', null, true);
            this.onDataRead(data);
        } catch (error) {
            console.error('Failed to load data:', error);
            GSLog.error(this, error);
        }
    }

    #button(type) {
        return this.queryAll(`button[type="${type}"]`, true);
    }

    #childrens(shadow = false) {
        return this.queryAll('input,select,output,textarea', shadow);
    }

    get owner() {
        return this[Symbol.for('gs-owner')]();
    }

    get parentComponent() {
        return this[Symbol.for('gs-parent')]();
    }    

    get hasUpdated() {
        return this.#hasUpdated;
    }

    get asJSON() {
        const data = {};
        this.inputs.forEach(field => GSDOM.fromElement2Object(field, data));
        return data;
    }

    set asJSON(data) {
        const me = this;
        me.inputs.forEach(field => GSDOM.fromObject2Element(field, data));
        me.#controllerHandler?.validate();
    }

    get autocopy() {
        return this.hasAttribute('autocopy');
    }
    
    get autoselect() {
        return this.hasAttribute('autoselect');
    }

    /**
     * If set, automatically calls reportValidity
     */
    get autoreport() {
        return this.hasAttribute('autoreport');
    }

    /**
     * If set, automatically calls checkValidity
     */
    get autovalidate() {
        return this.hasAttribute('autovalidate');
    }

    /**
     * If set, automatically submit form on field enter.
     * Forms auto submit only if there is a input or a button of type="submit"
     */
    get autosubmit() {
        return this.hasAttribute('autosubmit');
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

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(value) {
        GSAttr.toggle(this, 'disabled', GSUtil.asBool(value));
    }

    set autocopy(value) {
        GSAttr.toggle(this, 'autocopy', GSUtil.asBool(value));
    }

    set autoselect(value) {
        GSAttr.toggle(this, 'autoselect', GSUtil.asBool(value));
    }

    set autoreport(value) {
        GSAttr.toggle(this, 'autoreport', GSUtil.asBool(value));
    }

    set autovalidate(value) {
        GSAttr.toggle(this, 'autovalidate', GSUtil.asBool(value));
    }

    set autosubmit(value) {
        GSAttr.toggle(this, 'autosubmit', GSUtil.asBool(value));
    }

    set block(val = false) {
        GSAttr.toggle(this, 'block', GSUtil.asBool(val));
    }

    set beep(val = false) {
        GSAttr.toggle(this, 'beep', GSUtil.asBool(val));
    }

    set timeout(val = 0) {
        return GSAttr.setAsNum(this, 'timeout', val);
    }

    get submitButton() {
        return this.#button('submit');
    }

    get resetButton() {
        return this.#button('reset');
    }

    /**
     * Pickup all form elements, including custom ones
     */
    get elements() {
        return super.elements;
    }

    /**
     * Get all form attached native fields unwrapepd from GSWebComponents
     */
    get fields() {
        return Array.from(this.elements).map(el => el.field || el);
    }

    /**
     * Find all inputs by querying across inner shadow 
     */
    get inputs() {
        return this.#childrens(true);
    }

    get invalid() {
        return this.inputs
        .filter(el => !el.disabled)
        .filter(el => !el.validity.valid);
    }

    get isValid() {
        return this.invalid.length === 0;
    }

    get #controllerHandler() {
        return this[HANDLER_KEY];
    }
}

