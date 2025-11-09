/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSUtil, GSEvents, GSDialogElement} from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

import { Utils } from '../utils/Utils.mjs';

/**
 * A module loading GSAsbtractDialog class
 * @module dialogs/GSAsbtractDialog
 */

export class GSAsbtractDialog extends GSDialogElement {

    static {
        this.define('gs-admin-dialog');
    }

    static properties = {
        dismissable: { reflect: true, type: Boolean },
    }

    #data = null;

    constructor() {
        super();
        const me = this;
        me.dismissable = false;
        me.bordered = true;
        me.opened = false;
        me.closable = true;
        me.cancelable = true;
        me.escapable = true;
        me.cssBody = 'p-0';
        me.cssHeader = 'p-3 dialog-title';        
        //me.cssTitle = 'fs-5 fw-bold text-muted';
    }

    firstUpdated() {
        super.firstUpdated();
        const me = this;
        me.on('data', me.#onFormData.bind(me));
        me.on('error', me.#onFormError.bind(me));
        me.on('notify', me.#onNotify.bind(me));
        GSEvents.monitorAction(this);
    }

    /**
     * Override parent class method
     * @param {*} data 
     */
	open(data) {
		this.#data = data;
		super.open();
	}

    /**
     * Update dialog forms 
     */
    afterOpen() {
        const me = this;
        me.reset(me.#data);
        if (GSUtil.isJson(me.#data)) {
            me.emit('change');
        }
    }

    afterClose() {
        this.#data = null
    }

    get isHashed() {
        return GSUtil.asBool(this.dataset.gsHashed);
    }

    /**
     * Used by inherited dialogs to process confirmed dialog form
     * @param {*} data 
     */
    async onData(data) {
        return true;
    }

    async templateInjected() {
        const form = this.form;
        if (form) form.data = await this.loadDefaults();
    }    

    async loadDefaults() {
        return this.#data;
    }

    /**
     * Wait dialog
     */
    get waiter() {
        return Utils.waiter;
    }

    /**
     * Get dialog form
     */
    get form() {
        return this.query('gs-form', true);
    }

    // auto remove on close
    #onNotify(e) {
        const me = this;
        if (!me.opened && me.dismissable && e.detail === 'closing') me.remove();
        if (me.opened) {
            me.afterOpen();
        } else {
            me.afterClose();
        }
    }

    #onFormError(e) {
        Utils.inform(false, 'Some fields are invalid!');
    }

    #onFormData(e) {
        // prevent close on confirm click
        GSEvents.prevent(e);
        this.#handleFormData(e);
    }

    async #handleFormData(e) {
        const me = this;
        let sts = false;
        try {
            me.disabled = true;
            sts = await me.onData(e.detail);
        } catch (e) {
            Utils.handleError(e);
        } finally {
            me.disabled = false;
            if (sts) {
                me.close();
                //Utils.notify.secondary('', 'Changes applied!', false, 0.75);
            }
        }
    }

    onError(e) {
        Utils.handleError(e);
    }

}

