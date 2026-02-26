/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSAsbtractDialog } from '../dialogs/GSAsbtractDialog.mjs';

/**
 * A module loading GSTunnel class
 * @module dialogs/GSTunnel
 */

/**
 * SSH and SOCK5 tunnel dialog
 */
export class GSTunnel extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-tunnel');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//forms/tunnel.html";
        me.title = "Network Tunnel";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.activate(data);
        return o.success;
    }

}