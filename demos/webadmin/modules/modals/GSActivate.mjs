/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSAsbtractDialog } from '../dialogs/GSAsbtractDialog.mjs';

/**
 * A module loading GSActivate class
 * @module dialogs/GSActivate
 */

/**
 * Available when install.exe exist
 */
export class GSActivate extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-activate');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//modals/activate.html";
        me.title = "Add license key to the IBM i server";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Activator.activate(data);
        return o.success;
    }
}