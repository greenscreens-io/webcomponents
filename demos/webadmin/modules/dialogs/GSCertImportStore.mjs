/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSDOM } from '../../../../modules/base/GSDOM.mjs';
import { Utils } from '../utils/Utils.mjs';
import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSCertImportStore class
 * @module dialogs/GSCertImportStore
 */
export class GSCertImportStore extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-certstoreimport');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Import PFX/PEM Certificate Store";
        me.template = "//dialogs/certificates-import-store.html";
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

}