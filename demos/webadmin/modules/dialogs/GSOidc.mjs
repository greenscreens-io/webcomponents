/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSOidc class
 * @module dialogs/GSOidc
 */
export class GSOidc extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-oidc');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Identitiy Provider Options";
        me.template = "//dialogs/oidc.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.system.Oidc.save(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.system.Oidc.load();
        return o.data;
    }
    
}