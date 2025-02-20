/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../utils/Utils.mjs';
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
        me.opened = true;
        me.dismissable = true;
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
        if (o.success) {
            Utils.notify.secondary('', 'Kerberos reloaded', true);
        } else {
            Utils.notify.danger('Error', o.msg, true);
        }
        return o.success;
    }
}