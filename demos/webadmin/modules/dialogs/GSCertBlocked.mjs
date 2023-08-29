/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertBlocked class
 * @module dialogs/GSCertBlocked
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSCertBlocked extends GSAsbtractDialog {

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

    async onFormInit(form) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getBlocked();
        super.onFormInit(form, { list: o.msg });
    }
    
    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.setBlocked(data.list);
        return o.success;
    }
}