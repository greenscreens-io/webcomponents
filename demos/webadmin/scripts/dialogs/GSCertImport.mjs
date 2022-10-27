/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertImport class
 * @module dialogs/GSCertImport
 */
import GSAdminDialog from './GSAdminDialog.mjs';

export default class GSCertImport extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-certimport', GSCertImport);
        Object.seal(GSCertImport);
    }

    onReady() {
        super.onReady();
        if (this.large) this.large();
    }

    get dialogTemplate() {
        return '//dialogs/certificates-import.html';
    }

    get dialogTitle() {
        return 'Import Certificates';
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.setFromPEM(data.rootCAPub, data.rootCAPriv,
            data.serverPub, data.serverPriv, data.rootPass, data.serverPass);
        return o.success;
    }

}