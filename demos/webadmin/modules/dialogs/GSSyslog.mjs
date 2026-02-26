/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSOtpOptions class
 * @module dialogs/GSOtpOptions
 */
export class GSSyslog extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-syslog');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Syslog Options";
        me.template = "//dialogs/syslog.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.setSyslog(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getSyslog();
        return o.data;
    }

}