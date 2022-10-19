/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import GSAttr from '../../../../modules/base/GSAttr.mjs';
import GSComponents from '../../../../modules/base/GSComponents.mjs';
import GSDOM from '../../../../modules/base/GSDOM.mjs';
import GSEvent from '../../../../modules/base/GSEvent.mjs';
import GSFunction from '../../../../modules/base/GSFunction.mjs';
import GSLoader from '../../../../modules/base/GSLoader.mjs';
import GSModal from '../../../../modules/components/GSModal.mjs';


export default class GSDialog extends GSModal {

    connectedCallback() {
        super.connectedCallback();
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
        me.on('action', me.#onAction.bind(me));
        me.on('error', me.#onError.bind(me));

        const tpl = await GSLoader.getTemplate(me.dialogTemplate);
        requestAnimationFrame(() => {
            GSDOM.setHTML(me, tpl);
            me.title = me.dialogTitle;
            if (me.auto) me.open();
        });
    }

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
        if (!me.notify) return;
        if (success) return me.notify.info('Info', msg);
        me.notify.danger('Error', msg);
        return success;
    }

    #handleError(e) {
        console.log(e);
        this.inform(false, e.data?.error || e.msg || e.message || e.toString());
    }

    #onError(e) {
        this.inform(false, 'Some fields are invalid!');
    }

    async open(data) {
        const me = this;
        me.form?.reset();
        data = await me.onOpen(data);
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
            const sts = await me.onData(e.detail.data);
            if (sts) me.close();
        } catch (e) {
            me.#handleError(e);
        }
    }

    async #onAction(e) {
        const me = this;
        if (!e.detail.action) return;
        try {
            const action = GSUtil.capitalizeAttr(e.detail.action);
            const fn = me[action];
            if (GSFunction.isFunction(fn)) {
                if (GSFunction.isFunctionAsync(fn)) {
                    await me[action](e);
                } else {
                    me[action](e);
                }
            }
        } catch (e) {
            me.#handleError(e);
        }
    }

}