/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSInstall class
 * @module dialogs/GSInstall
 */
import GSAdminDialog from './GSAdminDialog.mjs';

/**
 * Available when install.exe does not exist
 */
export default class GSInstall extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-install', GSInstall);
        Object.seal(GSInstall);
    }

    get dialogTemplate() {
        return '//dialogs/install.html';
    }

    get dialogTitle() {
        return 'Install product to the IBM i server';
    }

    async onOpen(data) {
        return { ipAddress: data?.ipAddress || '' };
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Installer.installProduct(data);
        return o.success;
    }
}