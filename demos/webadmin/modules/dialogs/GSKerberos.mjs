/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSKerberos class
 * @module dialogs/GSKerberos
 */
export class GSKerberos extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-kerberos');
    }

    constructor() {
        super();
        const me = this;
        me.title = "SSO Options";
        me.template = "//dialogs/kerberos.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.save(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.load();
        return o.data;
    }
    
    async onReloadKerberos() {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.reload();
        return o.success;
    }
}