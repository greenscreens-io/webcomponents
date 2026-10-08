/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSCertOpt class
 * @module dialogs/GSCertOpt
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSCertOpt extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-certopt', GSCertOpt);
        Object.seal(GSCertOpt);
    }

    onReady() {
        super.onReady();
        if (this.large) this.large();
    }

    get dialogTemplate() {
        return '//dialogs/certificates-options.html';
    }

    get dialogTitle() {
        return 'Certificate Options';
    }

    async onFormInit(form, data) {
        if(DEMO)  {
            data = DEMO;            
        } else {
            data = await io.greenscreens.Certificate.loadConfig();
            data = data.data;
        }
        super.onFormInit(form, data);
    }

    async onData(data) {
		if (DEMO) {
			super.onData();
			return true;	
		}

		if (data.acmeStatus === "1") {
	        const opt = await io.greenscreens.system.Interface.load();
	        if (opt.data.port != 80) {
				const msg = 'For ACME to work properly, port 80 must be open.\nClick \'OK\' to continue.';
				if (!confirm(msg)) return false;	
			}			
		}		
        const ret = await io.greenscreens.Certificate.saveConfig(data);
        super.onData();
        return ret.success;
    }

}