/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading Shell Sidebar class
 * @module shell
 */

import { GSComponents, GSElement, GSEvents } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
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
        GSEvents.monitorAction(this);
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
    /*
    async restart() {
		const sts = globalThis.confirm('Are you sure? Action will restart server and terminate all connections.');
        if (!sts) return true;
        const o = DEMO ? DEMO : await io.greenscreens.Server.restart();
        Utils.inform(o.success, 'Server is restarting! <br>Wait about 1 min. then refresh browser.');
    }
    */

	// reload certificates into server
	async onCertServerRefresh() {
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.reload();
        const msg = o.msg || 'Certificates applied to the server.';
        Utils.inform(true, msg);
	}

    // toggle client verification
    async onCertClientVerify() {
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.verifySSLClient(2);
        const msg = o.msg || 'Client SSL verification changed.';
        Utils.inform(true, msg + '<br>Restart server to apply changes.');
    }

    // regenerate session keys
    async onCertGenTerm() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.regenerate();
        if (o.code === 'RSA') Utils.inform(true, 'New encryption keys generated');
    }

    // generate server cert request
    async onCertGenReq() {
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.request();
        const csr = o.data?.data?.commonNameServer || 'server_request';
        Utils.download(csr + '.csr', o.data.requestPem);
        const sts = globalThis.confirm('Do you want to download a private key also?');
        if (!sts) return;
        const key = o.data?.data?.commonNameServer || 'server_request';
        Utils.download(key + '.key', o.data.privatePem);
        //Utils.download(key + '.pem', data.publicPem);
    }

    // generate server cert
    async onCertGenSvr() {
        const sts = confirm('Are you sure? Action will overwrite existnig certificate.');
        if (!sts) return;
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.generate(true);
        Utils.inform(true, 'New server certificate generated! <br> Please, restart server for changes to apply.');
    }

    onCertExport() {
        Utils.openInNewTab(`${location.origin}/services/certificate?id=0`);
        Utils.openInNewTab(`${location.origin}/services/certificate?id=1`);
    }

    onExplorer() {
        Utils.openInNewTab(`${location.origin}/admin/explorer`, 'toolbar=no,scrollbars=yes,resizable=yes');
    }

    onDownloadSavf() {
        Utils.openInNewTab(`${location.origin}/services/admintransfer?type=savf`);
    }

    onDownloadConfig() {
        Utils.openInNewTab(`${location.origin}/services/admintransfer?type=conf`);
    }

    onDownloadLogs() {
        Utils.openInNewTab(`${location.origin}/services/admintransfer?type=log`);
    }

}
