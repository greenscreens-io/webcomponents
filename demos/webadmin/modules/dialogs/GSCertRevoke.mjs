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

    get input () {
        return GSDOM.query(this, 'gs-filebox')?.query('input');
    }

    get file() {
        const input = this.input;
        if (!input?.files?.length > 0) return false;
        return input.files[0];
    }

    get isPEM() {
		return this.isExt('.pem') || this.isExt('.cer');
	}

    get isPFX() {
		return this.isExt('.pfx');
	}

    isExt(val) {
		return this.file?.name.endsWith(val);
	}
	    	
    async fileToHex() {
        const buff = await this.file?.arrayBuffer();
        return Utils.toHex(buff);
    }

    async onData(data) {
		if (DEMO) return DEMO.success;
		const me = this;
		let tmp = data.email;
		if (!tmp) tmp = await me.fileToHex();
		if (!tmp) return false;
	    const o = await io.greenscreens.Certificate.revokeClient(tmp);
	    if (o.msg) Utils.notify.secondary('Client certificate revoking', o.msg, true, 4, 0.2);
	    me.enable();
	    me.visible = false;
	    /*
		super.onData();
        return o.success;
        */
    }

}