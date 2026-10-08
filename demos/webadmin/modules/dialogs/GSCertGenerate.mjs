/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSCertImport class
 * @module dialogs/GSCertImport
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSCertGenerate extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-certgen', GSCertGenerate);
        Object.seal(GSCertGenerate);
    }

    onReady() {
        super.onReady();
        if (this.large) this.large();
    }

    get dialogTemplate() {
        return '//dialogs/certificates-generate.html';
    }

    get dialogTitle() {
		const type = this.timestamp ? 'Timestamping' : 'Server';
        return `Generate ${type} certificate`;
    }

    get timestamp() {
        return GSAttr.getAsBool(this, 'timestamp', false);
    }

    set timestamp(val = false) {
        GSAttr.setAsBool(this, 'timestamp', val);
    }
    
    async onData(data) {
		const sts = globalThis.confirm('Are you sure? Action will overwrite existing certificate.');
        if (!sts) return true;
		if (DEMO) return DEMO.success;
        const o = await io.greenscreens.Certificate.generate(data.root, data.intermediate, this.timestamp);			
		super.onData();
        return o.success;
    }

}