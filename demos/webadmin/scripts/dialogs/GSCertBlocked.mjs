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

    async onOpen() {
        const me = this;
        const o = {success: true, data : {}};
        if (!o.success) return me.inform(false, o.msg);
        return { list : o.msg};
    }

    async onData(data) {
        const me = this;
        const o = {success: true, data : {}};
        me.inform(o.success, o.success ? 'Data saved!' : o.msg);
        return o.success;
    }    
}