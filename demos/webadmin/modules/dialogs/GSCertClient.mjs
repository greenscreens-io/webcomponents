/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../utils/Utils.mjs';
import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSCertClient class
 * @module dialogs/GSCertClient
 */
export class GSCertClient extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-certclient');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Generate Client Certificates";
        me.template = "//dialogs/certificates-client.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.generateClient(data);
        const arr = Utils.fromHex(o.msg);
        const raw = new Uint8Array(arr);
        Utils.download(o.code, raw);
        return o.success;
    }    

}