/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSKerbLite class
 * @module dialogs/GSKerbLite
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSOidc extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-oidc', GSOidc);
        Object.seal(GSOidc);
    }

    onReady() {
        super.onReady();
		const me = this;
        if (me.large) me.large();
    }

    get dialogTemplate() {
        return '//dialogs/oidc.html';
    }

    get dialogTitle() {
        return 'Identity Provider (OIDC)';
    }

	async onFormInit(form, data) {
	    if(DEMO)  {
	        data = DEMO;            
	    } else {
	        data = await io.greenscreens.system.Oidc.load();
	        data = data.data;
	    }
	    super.onFormInit(form, data);
	}
		   
    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.system.Oidc.save(data);
        super.onData();
        return o.success;
    }
   
}