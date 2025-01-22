/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../utils/Utils.mjs';
import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSMigrate class
 * @module dialogs/GSMigrate
 */
export class GSMigrate extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-migrate');
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Migrate Storage";
        me.template = "//dialogs/migrate.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.migrate(data.path);
        if (o.success) this.inform();
        return o.success;
    }    

    inform() {
		Utils.notify.primary('', 'Migration started, check server logs for details!');
	}    
}