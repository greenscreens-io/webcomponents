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

    async loadData() {
        const me = this;
        const o = await io.greenscreens.Server.getConfig();
        if (!o.success) return me.inform(false, o.msg);
        delete o.data.password;
        return o.data;
    }

    async onConfirm(data) {
        const me = this;
        const o = await io.greenscreens.Server.newAuth(data);
        me.inform(o.success, o.success ? 'Data saved!' : o.msg);
        return o.success;
    }    

}