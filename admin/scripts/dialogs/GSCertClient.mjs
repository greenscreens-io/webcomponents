/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertClient class
 * @module dialogs/GSCertClient
 */
import GSDialog from './GSDialog.mjs';
import Utils from '../util.mjs';

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

    async onConfirm(data) {
        const me = this;
        const o = await io.greenscreens.Certificate.generateClient(data);
        me.inform(o.success, o.success ? 'Certificate saved!' : o.msg);

        if (o.success) {
            const arr = Utils.fromHex(o.msg);
            const raw = new Uint8Array(arr);
            Utils.download(o.code, raw);	 
        }

        return o.success;
    }    
  
}

