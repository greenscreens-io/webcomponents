/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSResGSSystemtart class
 * @module dialogs/GSSystem
 */
export class GSSystem extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-system');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "System options";
        me.template = "//dialogs/system.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.setConfig(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getConfig();
        return o.data;
    }

    async onReloadKerberos() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.reloadKerberors();
        return o.success;
    }
}