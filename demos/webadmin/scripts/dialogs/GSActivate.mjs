/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSActivate class
 * @module dialogs/GSActivate
 */
import GSAdminDialog from './GSAdminDialog.mjs';

/**
 * Available when install.exe exist
 */
export default class GSActivate extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-activate', GSActivate);
        Object.seal(GSActivate);
    }

    get dialogTemplate() {
        return '//dialogs/activate.html';
    }

    get dialogTitle() {
        return 'Add license key to the IBM i server';
    }

    async onOpen(data) {
        return { ipAddress: data?.ipAddress || '' };
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Activator.activate(data);
        return o.success;
    }
}