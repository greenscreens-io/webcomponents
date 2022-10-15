/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading Shell Sidebar class
 * @module shell
 */

import GSFunction from "../../../../modules/base/GSFunction.mjs";
import GSElement from "../../../../modules/base/GSElement.mjs";

/**
 * Class representing UI shell sidebar
 * @class
 * @extends {GSElement}
 */
export default class HeaderUI extends GSElement {


    static {
        customElements.define('gs-admin-shell-header', HeaderUI);
        Object.seal(HeaderUI);
    }

    async getTemplate() {
        return super.getTemplate('//shell/header.html');
    }

    onReady() {
        super.onReady();
        const me = this;
        me.on('action', me.#onAction.bind(me));
        me.queryAll('gs-dropdown').forEach(el => me.attachEvent(el, 'action', me.#onAction.bind(me)));
    }

    #onAction(e) {
        const me = this;
        const action = e?.detail?.action || e?.detail?.source?.target?.dataset?.action;
        const fnName = action.split('-').map((v, i) => i === 0 ? v : me.#capitalize(v)).join('');
        if (GSFunction.isFunction(me[fnName])) me[fnName](e);
    }

    #capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * UI Notificator
     */
     get notify() {
        return GSComponents.get('notification');
    }

    async logout() {        
        this.notify.info('Info', 'Close admin console');
    }

    explorer() {
        
    }

    async restart() {
        const me = this;
        me.notify.info('Info','Restart server requested');
        const o = {success: true};
        if (o.success) {
            me.notify.info('Info','Server is restarting! <br>Wait about 1min. then refresh browser.');
        } else {
            me.notify.danger('Info', o.msg);
        }
    }

    // toggle client verification
    async certClientVerify() { 
        const me = this;
        const o = {success: true};
        if (!o.success) return me.notify.danger('Error', o.msg);
        const msg = o.msg || 'Client SSL verification changed.';
        me.notify.info('Info',  msg + '<br>Restart server to apply changes.');
    }

    // regenerate session keys
    async certGenTerm() {
        const me = this;
        const o = {success: true};
        if (o.success && o.code === 'RSA') return me.notify.info('Info', 'New encryption keys generated');
        me.notify.danger('Error', o.msg);
    }

    // generate server cert request
    async certGenReq() {
        const me = this;
        const o = {success: true};
        if (!o.success) return me.notify.danger('Error', o.data.msg || 'Certificate not generated');	

    }

    // generate server cert
    async certGenSvr() {
        const sts = confirm('Are you sure? Action will overwrite existnig certificate.');
        if (!sts) return;
        const o = {success: true};
        if (o.success) {
            this.notify.info('Info', 'New server certificate generated! <br> Please, restart server for changes to apply.');
        } else {
            this.notify.danger(res.msg);
        }

    }

    certExport() {
        
    }

    downloadSavf() {
        
    }

    downloadConfig() {
        
    }

    downloadLogs() {
        
    }
    
}
