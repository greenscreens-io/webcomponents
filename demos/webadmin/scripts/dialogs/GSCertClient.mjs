/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertClient class
 * @module dialogs/GSCertClient
 */
import GSAdminDialog from './GSAdminDialog.mjs';

export default class GSCertClient extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-certclient', GSCertClient);
        Object.seal(GSCertClient);
    }

    get dialogTemplate() {
        return '//dialogs/certificates-client.html';
    }

    get dialogTitle() {
        return 'Generate Client Certificates';
    }

    async onData(data) {

        const o = DEMO ? DEMO : await io.greenscreens.Certificate.generateClient(data);

        const arr = Utils.fromHex(o.msg);
        const raw = new Uint8Array(arr);
        Utils.download(o.code, raw);

        return o.success;
    }

}

