/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSLoginDefaults class
 * @module dialogs/GSLoginDefaults
 */
export class GSLoginDefaults extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-logindefs');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Login Defaults";
        me.template = "//dialogs/login-defaults.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.saveDefaults(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getDefaults();
        delete o.data.password;
        return o.data;
    }
}