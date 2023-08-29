/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSActivate class
 * @module dialogs/GSActivate
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

/**
 * Available when install.exe exist
 */
export default class GSActivate extends GSAsbtractDialog {

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

    async onFormInit(form, data) {
        data = data || form?.data;
        data = { ipAddress: data?.ipAddress || '' };
        super.onFormInit(form, data);
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Activator.activate(data);
        return o.success;
    }
}