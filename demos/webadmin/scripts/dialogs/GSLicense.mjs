/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLicense class
 * @module dialogs/GSLicense
 */
import GSAdminDialog from './GSAdminDialog.mjs';

/**
 * Available when install.exe does not exist
 */
export default class GSLicense extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-license', GSLicense);
        Object.seal(GSLicense);
    }

    get dialogTemplate() {
        return '//dialogs/license.html';
    }

    get dialogTitle() {
        return 'Add license key to the IBM i server';
    }

    async onOpen(data) {
        return { ipAddress: data?.ipAddress || '' };
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Installer.addProductLicense(data);
        return o.success;
    }
}