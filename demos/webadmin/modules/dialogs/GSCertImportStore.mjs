/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertImport class
 * @module dialogs/GSCertImport
 */
import GSAdminDialog from './GSAdminDialog.mjs';
import Utils from '../utils/Utils.mjs';

export default class GSCertImport extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-certstoreimport', GSCertImport);
        Object.seal(GSCertImport);
    }

    onReady() {
        super.onReady();
        if (this.large) this.large();
    }

    get dialogTemplate() {
        return '//dialogs/certificates-import-store.html';
    }

    get dialogTitle() {
        return 'Import PFX/PEM Certificate Store';
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
		return this.isExt('.pem');
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
        data.hex = await me.fileToHex();
        let o = false;
        if (me.isPEM) {
	        o = await io.greenscreens.Certificate.loadFromPEM(data.hex, data.password, data.type);
		} else if (me.isPFX) {
        	o = await io.greenscreens.Certificate.loadFromPFX(data.hex, data.password, data.type);			
		} else {
			throw new Error('PEM or PFX file format supported!');
		}
        return o.success;
    }

}