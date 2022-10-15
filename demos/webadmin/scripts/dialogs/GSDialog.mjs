/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import GSDOM from '../../../../modules/base/GSDOM.mjs';
import GSEvent from '../../../../modules/base/GSEvent.mjs';
import GSLoader from '../../../../modules/base/GSLoader.mjs';
import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSDialog extends GSModal {

    constructor() {
        super();
        const me = this;
        me.cssHeader = 'p-3 dialog-title';
        me.cssTitle = 'fs-5 fw-bold';
        me.cssBody = 'p-0';
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
        me.on('data', me.#onData.bind(me));
        me.on('error', me.#onError.bind(me));

        const tpl = await GSLoader.getTemplate(me.dialogTemplate);
        requestAnimationFrame(() => {
            GSDOM.setHTML(me, tpl);
            me.title = me.dialogTitle;
            me.#onOpen();
        });
    }

    /**
     * UI Notificator
     */
     get notify() {
        return GSComponents.get('notification');
    }

    /**
     * Used by inherited dialogs to load data into dialog forms
     * @returns {*}
     */
     async onOpen() {
        return null;
    }

    /**
     * Used by inherited dialogs to process confirmed dialog form
     * @param {*} data 
     */
    async onData(data) {
    }

    /**
     * Used by inherited dialogs to show notification on remote data fetch
     * 
     * @param {boolean} success Status message info/danger
     * @param {string} msg Message t oshow
     * @returns {boolean}
     */
    inform(success = false, msg) {
        const me = this;
        if (success) return me.notify.info('Info', msg);
        me.notify.danger('Error', msg);
        return success;
    }    

    #onError(e) {
        this.notify.danger('Error', 'Some fields are invalid!');
    }

    async #onOpen(e) {
        const me = this;
        const data = await me.onOpen();
        if (data === false) return;
        me.open();
        setTimeout(() => me.#update(data), 50);
    }

    #update(data) {
        GSDOM.queryAll(this, 'form').forEach(form => GSDOM.fromObject(form, data))
    }

    async #onData(e) {
        GSEvent.prevent(e);
        const me = this;
        try {
            const sts = await me.onData(e.detail.data);
            if (sts) me.close();
        } catch(e) {
            console.log(e);
            me.notify.danger('Error', e.message || 'Error handling dialog data!');
        }
    }

}