/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSEvents } from '../../../../modules/base/GSEvents.mjs';
import { GSDialogElement } from '../../../../modules/components/Dialog.mjs';
import { Utils } from '../Utils.mjs';


/**
 * A module loading GSAsbtractDialog class
 * @module dialogs/GSAsbtractDialog
 */

export class BaseDialog extends GSDialogElement {

    #data = null;

    constructor() {
        super();
        const me = this;
        me.bordered = true;
        me.shadow = true;
        me.opened = false;
        me.closable = true;
        me.cancelable = true;
        me.escapable = true;
        me.size = "medium";
        me.cssBody = 'p-0';
        me.cssHeader = 'p-3 dialog-title';
    }

    /**
     * Override parent class method
     * @param {*} data 
     */
    async templateInjected() {
        const form = this.form;
        if (form) form.data = this.#data;
    }    

    /**
     * Override parent class method
     * @param {*} data 
     */
    firstUpdated() {
        const me = this;
        super.firstUpdated();
        me.on('data', me.#onFormData.bind(me));
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
     * Override parent class method
     * @param {*} data 
     */
    afterOpen() {
        const me = this;
        me.reset(me.#data);
    }

    /**
     * Override parent class method
     * @param {*} data 
     */
    afterClose() {
        this.#data = null;
        this.reset();
    }

    /**
     * Used by inherited dialogs to process confirmed dialog form
     * @param {*} data 
     */
    async onData(data) {
        return true;
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

}