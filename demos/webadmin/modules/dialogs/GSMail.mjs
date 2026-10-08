/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSKerbLite class
 * @module dialogs/GSKerbLite
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSMail extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-mail', GSMail);
        Object.seal(GSMail);
    }

    onReady() {
        super.onReady();
		const me = this;
        if (me.large) me.large();
    }

    get dialogTemplate() {
        return '//dialogs/mail.html';
    }

    get dialogTitle() {
        return 'SMTP Mail Optionas';
    }

	async onFormInit(form, data) {
	    if(DEMO)  {
	        data = DEMO;            
	    } else {
	        data = await io.greenscreens.system.Mail.load();
	        data = data.data;
	    }
	    super.onFormInit(form, data);
	}
		   
    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.system.Mail.save(data);
        super.onData();
        return o.success;
    }
   
}