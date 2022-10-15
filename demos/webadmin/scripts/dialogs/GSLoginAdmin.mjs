/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import GSDialog from './GSDialog.mjs';

export default class GSLoginAdmin extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-loginadm', GSLoginAdmin);
        Object.seal(GSLoginAdmin);
    }

    get dialogTemplate() {
        return '//dialogs/login-admin.html';
    }

    get dialogTitle() {
        return 'Admin Login';
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