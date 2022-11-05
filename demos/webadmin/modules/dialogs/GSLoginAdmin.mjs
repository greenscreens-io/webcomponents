/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import GSAdminDialog from './GSAdminDialog.mjs';

export default class GSLoginAdmin extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-loginadm', GSLoginAdmin);
        Object.seal(GSLoginAdmin);
    }

    get dialogTemplate() {
        return '//dialogs/login-admin.html';
    }

    get dialogTitle() {
        return 'Admin Login';
    }

    async onOpen() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getConfig();
        delete o.data.password;
        return o.data;
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Session.newAuth(data);
        return o.success;
    }

}