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
import { ControllerHandler } from "./ControllerHandler.mjs";
import { mixin } from "./EventsMixin.mjs";

/**
 * Add JSON loader to select element
 * <textarea is="gs-ext-textarea"></textarea>
 * 
 * [{text:'', value:'' selected:true}]
 * 
 * @class
 * @extends { HTMLTextAreaElement }
 */
export class GSExtTextAreaElement extends HTMLTextAreaElement {

    static {
        mixin(GSExtTextAreaElement);
        GSDOM.define('gs-ext-textarea', GSExtTextAreaElement, { extends: 'textarea' });
        Object.seal(GSExtTextAreaElement);
    }

    #hasUpdated = false;
    #controllerHandler = undefined;

    constructor() {
        super();
        this.#controllerHandler = new ControllerHandler(this);
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
        const data = me.formComponent?.data;
        if (data) GSDOM.fromObject2Element(me, data);
        if (me.autofocus) me.focus();
    }

    willUpdate(changed, oldValue, newValue) {
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

    reset() {
        const me = this;
        me.setCustomValidity('');
        GSDOM.reset(me);
        me.validate();
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

    get owner() {
        return this[Symbol.for('gs-onwner')]();
    }

    get parentComponent() {
        return this[Symbol.for('gs-parent')]();
    }

    get hasUpdated() {
        return this.#hasUpdated;
    }

    /**
     * If set, autoamtically calls reportValidity
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

    get autoselect() {
        return this.hasAttribute('autoselect');
    }

    get autocopy() {
        return this.hasAttribute('autocopy');
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

    set autoreport(value) {
        GSAttr.toggle(this, 'autoreport', value);
    }

    set autovalidate(value) {
        GSAttr.toggle(this, 'autovalidate', value);
    }

    set autoselect(value) {
        GSAttr.toggle(this, 'autoselect', value);
    }

    set autocopy(value) {
        GSAttr.toggle(this, 'autocopy', value);
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
        const me = this;
        return super.form || me.owner?.form || me.closest?.('form');
    }

    async load(url = '') {
        if (!url) return;
        this.value = await GSLoader.loadSafe(url, 'GET', null, true);
    }

}

