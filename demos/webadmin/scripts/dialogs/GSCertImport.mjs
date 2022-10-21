/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertImport class
 * @module dialogs/GSCertImport
 */
import GSDialog from './GSDialog.mjs';

export default class GSCertImport extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-certimport', GSCertImport);
        Object.seal(GSCertImport);
    }

    onReady() {
        super.onReady();
        this.large();
    }

    get dialogTemplate() {
        return '//dialogs/certificates-import.html';
    }

    get dialogTitle() {
        return 'Import Certificates';
    }

    async onData(data) {
        const o = DEMO ? DEMO : io.greenscreens.Certificate.setFromPEM(data.rootCAPub, data.rootCAPriv,
            data.serverPub, data.serverPriv, data.rootPass, data.serverPass);
        return o.success;
    }

}