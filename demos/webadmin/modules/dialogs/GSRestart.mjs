/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertImport class
 * @module dialogs/GSCertImport
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSRestart extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-restart', GSRestart);
        Object.seal(GSRestart);
    }

    onReady() {
        super.onReady();
        if (this.large) this.large();
    }

    get dialogTemplate() {
        return '//dialogs/server-restart.html';
    }

    get dialogTitle() {
        return `Server restart`;
    }
    
    async onData(data) {
		if (DEMO) return DEMO.success;
        let o = null;
        if (data.type == 'true') {
        	o  = await io.greenscreens.Server.restart();			
		} else {
        	o  = await io.greenscreens.Server.reload();						
		}
        return o?.success;
    }

}