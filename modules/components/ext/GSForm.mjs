/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSForm class
 * @module components/ext/GSForm
 */

import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSDOMObserver from '../../base/GSDOMObserver.mjs';
import GSListeners from "../../base/GSListeners.mjs";
import GSComponents from "../../base/GSComponents.mjs";

/**
 * Add custom form processing to support forms in modal dialogs
 * <form is="gs-form">
 * @class
 * @extends {HTMLFormElement}
 */
export default class GSForm extends HTMLFormElement {

    static {
        customElements.define('gs-form', GSForm, { extends: 'form' });
        GSDOMObserver.registerFilter(GSForm.#onMonitorFilter, GSForm.#onMonitorResult);
        GSDOMObserver.registerFilter(GSForm.#onMonitorFilter, GSForm.#onMonitorRemove, true);
    }

    static #onMonitorFilter(el) {
        return el instanceof HTMLFormElement && (el instanceof GSForm) === false;
    }

    static #onMonitorResult(el) {
        GSForm.#attachEvents(el);
    }

    static #onMonitorRemove(el) {
        GSListeners.deattachListeners(el);
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['mask'];
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSForm.#attachEvents(me);
        //GSComponents.store(me);
    }

    disconnectedCallback() {
        const me = this;
        //GSComponents.remove(me);
        GSListeners.deattachListeners(me);
    }

    static #attachEvents(me) {
        GSListeners.attachEvent(me, me, 'submit', GSForm.#onSubmit.bind(me));
        GSListeners.attachEvent(me, GSForm.#buttonCancel(me), 'click', GSForm.#onCancel.bind(me));
        GSListeners.attachEvent(me, GSForm.#buttonReset(me), 'click', me.reset.bind(me));
        GSListeners.attachEvent(me, document.body, 'action', GSForm.#onAction.bind(me));
    }

    /**
     * 
     * @param {*} e 
     * @param {*} own 
     */
    static #onAction(e, own) {
        const me = own || this;
        if (e.detail.type !== 'modal') return;
        const modal = GSComponents.getOwner(me, 'GS-MODAL');
        if (modal !== e.target) return; 
        if (e.detail.ok) return GSForm.#onSubmit(e, me);
        
        const evt = e.detail.evt;
        const isReset = evt && evt.target.className.indexOf('reset') > 0;
        if (isReset) me.reset();
    }

    /**
     * Trigger form submit only if form data is valid
     * @param {*} e 
     */
    static #onSubmit(e, own) {
        GSUtil.preventEvent(e);
        GSForm.#submit(e, own || this);
    }

    static #submit(e, own) {
        const me = own || this;
        const isValid = me.checkValidity();
        const obj = GSUtil.toObject(me);
        if (e.detail) e.detail.data = obj;
        if (isValid) return GSUtil.sendEvent(me, 'form', { type: 'submit', data: obj, source: e }, true, true);
        GSUtil.preventEvent(e);
        return me.reportValidity();
    }

    static #onCancel(e, own) {
        const me = own || this;
        GSUtil.preventEvent(e);
        GSUtil.sendEvent(me, 'form', { type: 'cancel', source: e }, true, true);
    }

    get buttonOK() {
        return GSForm.#buttonOK(this);
    }

    get buttonCancel() {
        return GSForm.#buttonCancel(this);
    }

    get buttonReset() {
        return GSForm.#buttonReset(this);
    }

    static #hasButtons(own) {
        return GSForm.#buttonOK(own) || GSForm.#buttonCancel(own) || GSForm.#buttonReset(own);
    }

    static #buttonOK(own) {
        return GSUtil.findEl('button[type="submit"],.modal-ok', own);
    }

    static #buttonCancel(own) {
        const el = GSForm.#find(own, 'cancel');
        return el ? el : GSUtil.findEl('button:not([type="submit"]),.modal-cancel', own);
    }

    static #buttonReset(own) {
        return GSForm.#find(own, 'reset');
    }

    static #find(own, name = '') {
        return GSUtil.findEl(`button[data-action="${name}"],.modal-${name}`, own);
    }

}
