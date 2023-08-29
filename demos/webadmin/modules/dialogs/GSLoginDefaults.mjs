/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginDefaults class
 * @module dialogs/GSLoginDefaults
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSLoginDefaults extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-logindefs', GSLoginDefaults);
        Object.seal(GSLoginDefaults);
    }

    get dialogTemplate() {
        return '//dialogs/login-defaults.html';
    }

    get dialogTitle() {
        return 'Login Defaults';
    }

    async onFormInit(form) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getDefaults();
        delete o.data.password;
        super.onFormInit(form, o.data);
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.saveDefaults(data);
        return o.success;
    }

}