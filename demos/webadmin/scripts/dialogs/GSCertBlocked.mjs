/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertBlocked class
 * @module dialogs/GSCertBlocked
 */
import GSAdminDialog from './GSAdminDialog.mjs';

export default class GSCertBlocked extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-certblocked', GSCertBlocked);
        Object.seal(GSCertBlocked);
    }

    get dialogTemplate() {
        return '//dialogs/certificates-blocked.html';
    }

    get dialogTitle() {
        return 'Blocked Certificates';
    }

    async onOpen() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getBlocked();
        return { list: o.msg };
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.setBlocked(data.list);
        return o.success;
    }
}