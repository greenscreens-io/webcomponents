/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertOpt class
 * @module dialogs/GSCertOpt
 */
import { GSLoader } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
import GSAdminDialog from './GSAdminDialog.mjs';

export default class GSCertOpt extends GSAdminDialog {

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

    async onOpen() {
        if(DEMO)  return await GSLoader.loadSafe('./data/cert.json', 'GET', null, true);
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.loadConfig();
        return o.data;
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.saveConfig(data);
        return o.success;
    }

}