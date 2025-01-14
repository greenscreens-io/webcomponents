/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSEvents } from '../../../../modules/base/GSEvents.mjs';
import { GSUtil } from '../../../../modules/base/GSUtil.mjs';
import { GSDialogElement } from '../../../../modules/components/Dialog.mjs';

import { Utils } from '../utils/Utils.mjs';

/**
 * A module loading GSAsbtractDialog class
 * @module dialogs/GSAsbtractDialog
 */

export class GSAsbtractDialog extends GSDialogElement {

    static {
        this.define('gs-admin-dialog');
    }

    #data = null;

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.opened = true;
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
    }

    /**
     * Override parent class method
     * @param {*} data 
     */
	open(data) {
		this.#data = data;
		super.open(data);
	}

    afterOpen() {
        this.#update(this.#data);
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
        return null;
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

    /**
     * Update dialog forms 
     */
    #update(data) {
        if (GSUtil.isJson(data)) {
            const me = this;
            me.reset();
            me.forms.forEach(f => f.data = data);
            me.emit('change');
        }
    }

    // auto remove on close
    #onNotify(e) {
        if (!this.opened) this.remove();
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
            sts = await me.onData(e.detail.data);
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

