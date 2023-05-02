/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSNetwork class
 * @module dialogs/GSNetwork
 */
import GSAdminDialog from './GSAdminDialog.mjs';

export default class GSMigrate extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-migrate', GSMigrate);
        Object.seal(GSMigrate);
    }

    get dialogTemplate() {
        return '//dialogs/migrate.html';
    }

    get dialogTitle() {
        return 'Migrate Storage';
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.migrate(data.path);
        const me = this;
        o.success ? setTimeout(() => me.inform(),500) : me.inform();
        return o.success;
    }
    
    inform() {
		this.notify.primary('', 'Migration started, check server logs for details!');
	}

}