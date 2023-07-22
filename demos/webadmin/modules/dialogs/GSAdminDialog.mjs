/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import { GSAttr, GSComponents, GSDOM, GSEvents, GSLoader, GSDialog } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
import Utils from '../utils/Utils.mjs';

export default class GSAdminDialog extends GSDialog {

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.cssHeader = 'p-3 dialog-title';
        //me.cssTitle = 'fs-5 fw-bold text-muted';
        //me.cssBody = 'p-0';
    }

    get dialogTemplate() {
        return '';
    }

    get dialogTitle() {
        return '';
    }

    async onReady() {

        super.onReady();
        const me = this;

        me.on('data', me.#onFormData.bind(me));
        me.on('error', me.#onFormError.bind(me));

        const tpl = await GSLoader.getTemplate(me.dialogTemplate);
        requestAnimationFrame(() => {
            GSDOM.setHTML(me, tpl);
            me.title = me.dialogTitle;
            if (me.auto) me.open();
        });
    }

    /**
     * Should auto open
     */
    get auto() {
        return GSAttr.getAsBool(this, 'auto', true);
    }

    /**
     * Wait dialog
     */
    get waiter() {
        return GSComponents.get('modal-waiter');
    }

    /**
     * UI Notificator
     */
    get notify() {
        return GSComponents.get('notification');
    }

    /**
     * Dialog form
     */
    get form() {
        return GSDOM.query(this, 'form');
    }

    /**
     * Used by inherited dialogs to load data into dialog forms
     * @returns {*}
     */
    async onOpen(data) {
        return data;
    }

    /**
     * Used by inherited dialogs to process confirmed dialog form
     * @param {*} data 
     */
    async onData(data) {
        return true;
    }

    /**
     * Override GSModal open method, adds data
     * @param {*} data 
     * @returns 
     */
    async open(data) {
        const me = this;
        me.form?.reset();
        data = await me.onOpen(data);
        if (data === false) return;
        super.open();
        requestAnimationFrame(async () => {
            await GSUtil.timeout(200);
            me.#update(data);
        });
    }

    #update(data) {
        if (typeof data == 'object') GSDOM.queryAll(this, 'form').forEach(form => GSDOM.fromObject(form, data))
    }
   
    #onFormError(e) {
        Utils.inform(false, 'Some fields are invalid!');        
    }

    async #onFormData(e) {
        GSEvents.prevent(e);
        const me = this;
        let sts = false; 
        try {
			me.disable();
            sts = await me.onData(e.detail.data);
        } catch (e) {
            Utils.handleError(e);
        } finally {
			me.enable();
			if (sts) me.close();
		}
    }

    onError(e) {
        Utils.handleError(e);
    }

}

