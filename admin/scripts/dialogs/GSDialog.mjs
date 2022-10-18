/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import GSAttr from '../../../modules/base/GSAttr.mjs';
import GSDOM from '../../../modules/base/GSDOM.mjs';
import GSEvent from '../../../modules/base/GSEvent.mjs';
import GSLoader from '../../../modules/base/GSLoader.mjs';
import GSModal from '../../../modules/components/GSModal.mjs';

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

    get autoOpen() {
        return GSAttr.getAsBool(this, 'autoopen', true);
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
            if(me.autoOpen) me.open();
        });
    }

    get waiter() {
        GSDOM.query(document.body, '#modal-wait');
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
     async loadData() {
        return null;
    }

    /**
     * Used by inherited dialogs to process confirmed dialog form
     * @param {*} data 
     */
    async onConfirm(data) {
        return true;
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

    async open() {
        const me = this;
        const data = await me.loadData();
        if (data === false) return;
        super.open();
        setTimeout(() => me.#update(data), 50);
    }

    #update(data) {
        GSDOM.queryAll(this, 'form').forEach(form => GSDOM.fromObject(form, data))
    }

    async #onData(e) {
        GSEvent.prevent(e);
        const me = this;
        try {
            const sts = await me.onConfirm(e.detail.data);
            if (sts) me.close();
        } catch(e) {
            console.log(e);
            me.notify.danger('Error', e.message || 'Error handling dialog data!');
        }
    }

}