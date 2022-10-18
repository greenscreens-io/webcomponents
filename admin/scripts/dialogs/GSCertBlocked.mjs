/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertBlocked class
 * @module dialogs/GSCertBlocked
 */
import GSDialog from './GSDialog.mjs';

export default class GSCertBlocked extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-certblocked', GSCertBlocked);
        Object.seal(GSCertBlocked);
    }

    get dialogTemplate() {
        return '//dialogs/certificates-blocked.html';
    }

    get dialogTitle() {
        return 'Blocked Certificates';
    }

    async loadData() {
        const me = this;
        const o = await io.greenscreens.Server.getBlocked();
        if (!o.success) return me.inform(false, o.msg);
        return { list : o.msg};
    }

    async onConfirm(data) {
        const me = this;
        const o = await io.greenscreens.Server.setBlocked(data.list);
        me.inform(o.success, o.success ? 'Data saved!' : o.msg);
        return o.success;
    }    
}