/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSConfiguration class
 * @module views/GSConfiguration
 */
import GSDOM from '../../../../modules/base/GSDOM.mjs';
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSConfiguration extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-configuration', GSConfiguration);
        Object.seal(GSConfiguration);
    }

    get waiter() {
        GSDOM.query(document.body, '#modal-wait');
    }

    get modalValidation() {
        this.query('#modal-validation');
    }

    async getTemplate() {
        return super.getTemplate('//views/configurations.html');
    }

    async onLoad(e) {
        // press shift on refresh button to force reload
        const me = this;
        const o = await io.greenscreens.Hosts.list(e?.detail.source?.shiftKey === true);
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    async #set(data, msg) {
        const me = this;
        const o = await io.greenscreens.Hosts.setHost(data);
        me.inform(o.success, o.success ? msg : o.msg);
        if (o.success) me.refresh();
    }

    async onCreate(data) {
        return this.#set(data, 'Data created!');
    }

    async onUpdate(data) {
        return this.#set(data, 'Data updated!');
    }

    async onRemove(data) {
        const me = this;
        const o = await io.greenscreens.Hosts.unsetHost(data);
        me.inform(o.success, o.success ? 'Data removed!' : o.msg);
        if (o.success) me.refresh();
    }

    resetPrinter(e) {
        const data = e.detail.data[0];
        const modal = GSDOM.query(this, '#printer-reset');
        modal.open(data);
    }
    
    setupPrinter(e) {
        const data = e.detail.data[0];
        const modal = GSDOM.query(this, '#printer-setup');
        modal.open(data);
    }
    
    async validateServer(e) {
        const data = e.detail.data[0];
        const me = this;
        me.waiter.open();
        try {
            const o = await io.greenscreens.Hosts.validate(data);
            data.controller = obj.data.controller;
            if (!o.success) return  me.inform(o.success, o.msg);
        } finally {
            me.waiter.close();
        }
        me.modalValidation.body = `<pre>&{o.msg}</pre>`;
        me.modalValidation.open();
    }
}