/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSShell class
 * @module dialogs/GSShell
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

/**
 * Execute Wildfly Shell Console commands
 */
export default class GSShell extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-shell', GSShell);
        Object.seal(GSShell);
    }

    get dialogTemplate() {
        return '//dialogs/shell.html';
    }

    get dialogTitle() {
        return 'Server Console';
    }
	
	get result() {
		return this.query('output');
	}

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.system.Server.executeShell(false, data.commands);
        super.onData(o);
		console.log(o.msg);
		//this.result.value = (o.msg || '').split('Exception: ').pop();
		this.result.value = (o.msg || '').split('>>> ').pop().split('Exception: ').pop();
        return false; //o.success;
    }

}