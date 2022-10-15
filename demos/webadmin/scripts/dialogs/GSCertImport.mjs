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
        const me = this;
        me.large();

    }

    get dialogTemplate() {
        return '//dialogs/certificates-import.html';
    }

    get dialogTitle() {
        return 'Import Certificates';
    }

    async onData(data) {
        const me = this;
        const o = {success: true, data : {}};

        me.inform(o.success, o.success ? 'Data saved!' : o.msg);
        return o.success;
    }    

}