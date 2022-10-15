/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginDefaults class
 * @module dialogs/GSLoginDefaults
 */
import GSDialog from './GSDialog.mjs';

export default class GSLoginDefaults extends GSDialog {

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

    async onOpen() {
        const me = this;
        const o = {success: true, data : {}};
        if (!o.success) return me.inform(false, o.msg);
        return o.data;
    }

    async onData(data) {
        const me = this;
        const o = {success: true, data : {}};
        me.inform(o.success, o.success ? 'Data saved!' : o.msg);
        return o.success;
    }     

}