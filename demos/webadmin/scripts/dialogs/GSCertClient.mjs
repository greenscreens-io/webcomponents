/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertClient class
 * @module dialogs/GSCertClient
 */
import GSDialog from './GSDialog.mjs';

export default class GSCertClient extends GSDialog {

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
        const me = this;
        const o = {success: true, data : {}};
        me.inform(o.success, o.success ? 'Certificate saved!' : o.msg);

        return o.success;
    }    
  
}

