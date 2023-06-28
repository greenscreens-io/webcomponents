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

    constructor() {
        super();
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        GSFormExt.#attachEvents(me);
        //GSComponents.store(me);
    }

    disconnectedCallback() {
        const me = this;
        //GSComponents.remove(me);
        GSEvents.deattachListeners(me);
    }

    static #attachEvents(me) {
        GSEvents.attach(me, me, 'submit', GSFormExt.#onSubmit.bind(me));
    }

    /**
     * Trigger form submit only if form data is valid
     * @param {*} e 
     */
    static #onSubmit(e) {
        GSEvents.prevent(e);
        const me = this;
        const isValid = me.checkValidity() && me.isValid;
        if (!isValid) return me.reportValidity();
        const obj = GSDOM.toObject(me);
        const type = isValid ? 'submit' : 'invalid';
        const data = { type: type, data: obj, source: e, valid: isValid };
        GSEvents.send(me, 'form', data, true, true);
    }

    get isValid() {
        return GSDOM.queryAll(this, 'input,select,textarea')
            .map(el => el.checkValidity())
            .filter(v => v === false).length === 0;
    }

}

