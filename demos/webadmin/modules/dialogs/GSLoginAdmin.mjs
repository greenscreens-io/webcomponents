/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
export class GSLoginAdmin extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-loginadm');
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Admin Login";
        me.template = "//dialogs/login-admin.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Session.newAuth(data);
        return o.success;
    } 

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getConfig();
        delete o.data.password;
        return o.data;
    }

}