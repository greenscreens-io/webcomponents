/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import { GSAttr, GSComponents, GSDOM, GSEvents, GSLoader, GSDialog } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
import Utils from '../utils/Utils.mjs';
import GSUtil from '../../../../modules/base/GSUtil.mjs';

export default class GSAsbtractDialog extends GSDialog {

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

    /**
     * Override GSDialog method, to attach UI slot
     */
    async onBeforeReady() {

        await super.onBeforeReady();
        const me = this;

        me.on('data', me.#onFormData.bind(me));
        me.on('error', me.#onFormError.bind(me));

        const tpl = await GSLoader.getTemplate(me.dialogTemplate);
        GSDOM.setHTML(me, tpl);
        me.title = me.dialogTitle;
    }

    onReady() {
        const me = this;
        if (me.auto) me.open();
        super.onReady();
    }

    /**
     * Override parent class method
     * @param {*} data 
     */
    open(data) {
        const me = this;
        me.#update(data);
        super.open(data);
    }

    /**
     * Used by inherited dialogs to process confirmed dialog form
     * @param {*} data 
     */
    async onData(data) {
        return true;
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

    get forms() {
        return GSDOM.queryAll(this, 'form');
    }

    /**
     * Update dialog forms 
     */
    #update(data) {
        if (GSUtil.isJson(data)) {
            const me = this;
            me.forms.forEach(form => { form.reset(); form.data = data; });
            me.emit('change');
        }
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

