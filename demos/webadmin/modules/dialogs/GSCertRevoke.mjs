/*
* Copyright (C) 2015, 2023 Green Screens Ltd.
*/

/**
 * A module loading GSCertRevoke class
 * @module dialogs/GSCertRevoke
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';
import Utils from '../utils/Utils.mjs';

export default class GSCertRevoke extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-certrevoke', GSCertRevoke);
        Object.seal(GSCertRevoke);
    }

    onReady() {
        super.onReady();
        if (this.large) this.large();
    }

    get dialogTemplate() {
        return '//dialogs/certificates-revoke.html';
    }

    get dialogTitle() {
        return 'Revoke Client Certificate';
    }

    async onData(data) {
		if (DEMO) return DEMO.success;
		const me = this;
		if (!data?.email) return false;
	    const o = await io.greenscreens.Certificate.revokeClient(data.email);
	    if (o.msg) Utils.notify.secondary('Client certificate revoking', o.msg, true, 4, 0.2);
	    me.enable();
	    me.visible = false;
        return o.success;
    }

}