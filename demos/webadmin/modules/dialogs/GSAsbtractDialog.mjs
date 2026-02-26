/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSUtil } from '../../../../modules/base/GSUtil.mjs';
import { GSEvents } from '../../../../modules/base/GSEvents.mjs';
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

    static properties = {
        dismissable: { reflect: true, type: Boolean },
    }

    #data = null;

    constructor() {
        super();
        const me = this;
        me.bordered = true;
        me.shadow = true;
        me.dismissable = false;
        me.opened = false;
        me.closable = true;
        me.cancelable = true;
        me.escapable = true;
        me.cssBody = 'p-0';
        me.cssHeader = 'p-3 dialog-title';        
        //me.cssTitle = 'fs-5 fw-bold text-muted';
    }

    firstUpdated() {
        const me = this;
        super.firstUpdated();
        me.on('data', me.#onFormData.bind(me));
        me.on('error', me.#onFormError.bind(me));
        GSEvents.monitorAction(this);
    }

    /**
     * Override parent class method
     * @param {*} data 
     */
	open(data) {
        const me = this;
        const tab = me.tab;
        if (tab) tab.index = 0;
		me.#data = data;
		super.open();        
	}

    /**
     * Update dialog forms 
     */
    afterOpen() {
        super.afterOpen();
        const me = this;
        me.reset(me.#data);
        if (GSUtil.isJson(me.#data)) {
            me.emit('change');
        }
    }

    afterClose() {
        const me = this;
        me.#data = null;
        me.reset();
        if (me.dismissable) me.remove();
        super.afterClose();
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

    #onFormError(e) {
        Utils.inform(false, 'Some fields are invalid!');
    }

    async #onFormData(e) {
        // prevent close on confirm click
        GSEvents.prevent(e);
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
                me.emit('confirmed', e.detail);            
            }
        }
    }

    onError(e) {
        Utils.handleError(e);
    }

}

