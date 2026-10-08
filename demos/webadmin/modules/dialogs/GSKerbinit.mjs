/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSSystem class
 * @module dialogs/GSSystem
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSKerbinit extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-kerbinit', GSKerbinit);
        Object.seal(GSKerbinit);
    }

    onReady() {
        super.onReady();
		const me = this;
        if (me.large) me.large();
    }

    get dialogTemplate() {
        return '//dialogs/kerbinit.html';
    }

    get dialogTitle() {
        return 'Autoconfigure SSO';
    }

	async onFormInit(form, data) {
	    if(DEMO)  {
	        data = DEMO;            
	    } else {
	        data = await io.greenscreens.Kerberos.defaults();
	        data = data.data;
	    }
	    super.onFormInit(form, data);
	}
		   
    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.autoconfigure(data);
		// TODO notify error if not success
        super.onData();
        return o.success;
    }
   
}