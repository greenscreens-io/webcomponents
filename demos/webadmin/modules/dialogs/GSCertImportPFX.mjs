/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertImport class
 * @module dialogs/GSCertImport
 */
import GSAdminDialog from './GSAdminDialog.mjs';

export default class GSCertImport extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-certimportpfx', GSCertImport);
        Object.seal(GSCertImport);
    }

    onReady() {
        super.onReady();
        if (this.large) this.large();
    }

    get dialogTemplate() {
        return '//dialogs/certificates-importpfx.html';
    }

    get dialogTitle() {
        return 'Import Binary Certificate';
    }

    get input () {
        return GSDOM.query(this, 'gs-filebox')?.query('input');
    }

    get file() {
        const input = this.input;
        if (!input?.files?.length > 0) return false;
        return input.files[0];
    }

    async pfx() {
        const buff = await this.file?.arrayBuffer();
        return btoa(new Uint8Array(buff));
    }

    async onData(data) {
        data.pfx = await this.pfx();
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.setFromPFX(data.pfx, data.password);
        return o.success;
    }

}