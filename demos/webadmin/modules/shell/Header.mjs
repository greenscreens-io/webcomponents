/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

/**
 * A module loading Shell Sidebar class
 * @module shell
 */
import { GSComponents, GSElement} from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
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
		GSEvents.monitorAction(me);
    }
	
    /**
     * UI Notificator
     */
    get notify() {
        return GSComponents.get('notification');
    }

    // logout and replace with login tag
    async onLogout() {
        const o = DEMO ? DEMO : await io.greenscreens.Session.closeSession();		
        return o.success;
    }

    // restart server
    async onRestart() {
		const sts = globalThis.confirm('Are you sure? Action will restart server and terminate all connections.');
        if (!sts) return true;
        const o = DEMO ? DEMO : await io.greenscreens.system.Server.restart();
        Utils.inform(o.success, 'Server is restarting! <br>Wait about 1 min. then refresh browser.');
    }

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
        const o = DEMO ? DEMO : await io.greenscreens.Configs.regenerate();
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

    onCertExport() {
        Utils.openInNewTab(`${location.origin}/service.ca/certificate?id=0`);
        Utils.openInNewTab(`${location.origin}/service.ca/certificate?id=1`);
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
