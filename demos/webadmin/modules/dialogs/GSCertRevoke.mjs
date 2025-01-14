/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../utils/Utils.mjs';
import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSCertRevoke class
 * @module dialogs/GSCertRevoke
 */
export class GSCertRevoke extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-certrevoke');
    }

    constructor() {
        super();
        const me = this;
        me.title = "Revoke Client Certificate";
        me.template = "//dialogs/certificates-revoke.html";
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