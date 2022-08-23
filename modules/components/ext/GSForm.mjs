/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSForm class
 * @module components/ext/GSForm
 */

import GSID from "../../base/GSID.mjs";
import GSDOMObserver from '../../base/GSDOMObserver.mjs';
import GSEvent from "../../base/GSEvent.mjs";
import GSComponents from "../../base/GSComponents.mjs";
import GSDOM from "../../base/GSDOM.mjs";

/**
 * Add custom form processing to support forms in modal dialogs
 * <form is="gs-form">
 * @class
 * @extends {HTMLFormElement}
 */
export default class GSForm extends HTMLFormElement {

    static {
        customElements.define('gs-form', GSForm, { extends: 'form' });
        Object.seal(GSForm);
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
        GSEvent.deattachListeners(el);
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
        GSEvent.deattachListeners(me);
    }

    static #attachEvents(me) {
        GSEvent.attach(me, me, 'submit', GSForm.#onSubmit.bind(me));
        GSEvent.attach(me, document.body, 'action', GSForm.#onAction.bind(me));
    }

    /**
     * 
     * @param {*} e 
     * @param {*} own 
     */
    static #onAction(e, own) {
        const me = own || this;
        const sts = GSForm.#validateCaller(e, me, 'modal', 'GS-MODAL');
        if (!sts) return;

        if (e.detail.ok) return GSForm.#onSubmit(e, me);

        const evt = e.detail.evt;
        const isReset = evt && evt.target.className.indexOf('reset') > 0;
        if (isReset) me.reset();
    }

    static #validateCaller(e, own, type, comp) {
        if (e.detail.type !== type) return false;
        const parent = GSComponents.getOwner(own, comp);
        return parent == e.target || e.path.indexOf(parent) > -1;
    }

    /**
     * Trigger form submit only if form data is valid
     * @param {*} e 
     */
    static #onSubmit(e, own) {
        GSEvent.prevent(e);
        const me = own || this;
        const isValid = me.checkValidity();
        const obj = GSDOM.toObject(me);
        const type = isValid ? 'submit' : 'invalid';
        const data = { type: type, data: obj, source: e, valid: isValid };
        if (e.detail) e.detail.data = data;
        GSEvent.send(me, 'form', data, true, true);
        return me.reportValidity();
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

    static #buttonOK(own) {
        return GSDOM.findEl('button[type="submit"]', own);
    }

    static #buttonCancel(own) {
        return GSForm.#find(own, 'cancel');
    }

    static #buttonReset(own) {
        return GSForm.#find(own, 'reset');
    }

    static #find(own, name = '') {
        return GSDOM.findEl(`button[data-action="${name}"]`, own);
    }

}
