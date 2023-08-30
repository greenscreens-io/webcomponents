/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import { GSAttr, GSComponents, GSDOM, GSLoader, GSDialog } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
import Utils from '../utils/Utils.mjs';
import GSUtil from '../../../../modules/base/GSUtil.mjs';

export default class GSAsbtractDialog extends GSDialog {

    static {
        customElements.define('gs-admin-dialog', GSAsbtractDialog);
        Object.seal(GSAsbtractDialog);
    }

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.cssHeader = 'p-3 dialog-title';
        //me.cssTitle = 'fs-5 fw-bold text-muted';
        //me.cssBody = 'p-0';
    }

    get dialogTemplate() {
        return GSAttr.get(this, 'content', '');
    }

    get dialogTitle() {
        return GSAttr.get(this, 'title', '');
    }

    /**
     * Override GSDialog method, to attach UI slot
     */
    async onBeforeReady() {

        await super.onBeforeReady();
        const me = this;

        me.on('data', me.#onFormData.bind(me));
        me.on('error', me.#onFormError.bind(me));

        if (me.dialogTemplate) {
            let tpl = await GSLoader.getTemplate(me.dialogTemplate);
            tpl = GSDOM.parse(tpl);
            tpl.body.firstElementChild.slot = 'body';
            GSDOM.appendChild(me, tpl.body.firstElementChild);
            //GSDOM.setHTML(me, tpl);
        }
        if (me.dialogTitle) me.title = me.dialogTitle;
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

    #onFormError(e) {
        Utils.inform(false, 'Some fields are invalid!');
    }

    async #onFormData(e) {
        // GSEvents.prevent(e);
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

