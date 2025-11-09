/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSKerbinit class
 * @module dialogs/GSKerbinit
 */
export class GSKerbinit extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-kerbinit');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Autoconfigure SSO";
        me.template = "//dialogs/kerbinit.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.autoconfigure(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.defaults();
        return o.data;
    }
    
}