/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSKerbLite class
 * @module dialogs/GSKerbLite
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSKerbLite extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-ssolite', GSKerbLite);
        Object.seal(GSKerbLite);
    }

    onReady() {
        super.onReady();
		const me = this;
        if (me.large) me.large();
    }

    get dialogTemplate() {
        return '//dialogs/kerblite.html';
    }

    get dialogTitle() {
        return 'SSO Lite';
    }

	async onFormInit(form, data) {
	    if(DEMO)  {
	        data = DEMO;            
	    } else {
	        data = await io.greenscreens.Kerberos.loadLite();
	        data = data.data;
	    }
	    super.onFormInit(form, data);
	}
		   
    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.saveLite(data);
        super.onData();
        return o.success;
    }
   
}