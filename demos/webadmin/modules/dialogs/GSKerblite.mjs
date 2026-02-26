/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSKerbLite class
 * @module dialogs/GSKerbLite
 */
export class GSKerbLite extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-kerblite');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "SSO Lite";
        me.template = "//dialogs/kerblite.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.saveLite(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.loadLite();
        return o.data;
    }
    
}