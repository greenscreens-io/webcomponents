/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSProxy class
 * @module dialogs/GSProxy
 */
export class GSProxy extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-proxy');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Proxy Options";
        me.template = "//dialogs/proxy.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.system.Proxy.save(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.system.Proxy.load();
        return o.data;
    }
    
}