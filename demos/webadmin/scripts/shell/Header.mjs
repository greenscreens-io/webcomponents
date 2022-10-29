/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading Shell Sidebar class
 * @module shell
 */

import GSFunction from "../../../../modules/base/GSFunction.mjs";
import GSElement from "../../../../modules/base/GSElement.mjs";
import GSUtil from "../../../../modules/base/GSUtil.mjs";
import Utils from "../utils/Utils.mjs";

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

    async #onAction(e) {
        const me = this;
        try {
            const fnName = e?.detail?.action || e?.detail?.source?.target?.dataset?.action;
            const action = GSUtil.capitalizeAttr(fnName);
            const fn = me[action];
            if (GSFunction.isFunction(fn)) {
                if (GSFunction.isFunctionAsync(fn)) {
                    await me[action](e);
                } else {
                    me[action](e);
                }
            }
        } catch (e) {
            Utils.handleError(e);
        }
    }

    /**
     * UI Notificator
     */
    get notify() {
        return GSComponents.get('notification');
    }

    // logout and replace with login tag
    async logout() {
        try {
            Utils.unsetUI('gs-admin-shell-login');
            Utils.unsetUI('gs-admin-shell');
            const o = DEMO ? DEMO : await io.greenscreens.Session.closeSession();
            return o.success;
        } finally {
            location.reload();
        }
    }

    // restart server
    async restart() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.restart();
        Utils.inform(o.success, 'Server is restarting! <br>Wait about 1min. then refresh browser.');
    }

    // toggle client verification
    async certClientVerify() {
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.verifySSLClient(2);
        const msg = o.msg || 'Client SSL verification changed.';
        Utils.inform(true, msg + '<br>Restart server to apply changes.');
    }

    // regenerate session keys
    async certGenTerm() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.regenerate();
        if (o.code === 'RSA') Utils.inform(true, 'New encryption keys generated');
    }

    // generate server cert request
    async certGenReq() {
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.request(true);
        Utils.download("server_request.txt", o.data.requestPem);
        Utils.download("server_private.txt", o.data.privatePem);
        //Utils.download("server_public.txt", data.publicPem);
    }

    // generate server cert
    async certGenSvr() {
        const sts = confirm('Are you sure? Action will overwrite existnig certificate.');
        if (!sts) return;
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.generate(true);
        Utils.inform(true, 'New server certificate generated! <br> Please, restart server for changes to apply.');
    }

    certExport() {
        Utils.openInNewTab(`${location.origin}/services/certificate`);
    }

    explorer() {
        Utils.openInNewTab(`${location.origin}/admin/explorer`, 'toolbar=no,scrollbars=yes,resizable=yes');
    }

    downloadSavf() {
        Utils.openInNewTab(`${location.origin}/services/admintransfer?type=savf`);
    }

    downloadConfig() {
        Utils.openInNewTab(`${location.origin}/services/admintransfer?type=conf`);
    }

    downloadLogs() {
        Utils.openInNewTab(`${location.origin}/services/admintransfer?type=log`);
    }

}
