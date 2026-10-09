/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSMail class
 * @module dialogs/GSMail
 */
export class GSMail extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-mail');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Mail Options";
        me.template = "//dialogs/mail.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.system.Mail.save(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.system.Mail.load();
        return o.data;
    }
    
}