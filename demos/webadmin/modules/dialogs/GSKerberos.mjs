/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSSystem class
 * @module dialogs/GSSystem
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSKerberos extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-kerberos', GSKerberos);
        Object.seal(GSKerberos);
    }

    onReady() {
        super.onReady();
        if (this.large) this.large();
    }

    get dialogTemplate() {
        return '//dialogs/kerberos.html';
    }

    get dialogTitle() {
        return 'SSO Options';
    }

    async onFormInit(form) {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.load();
        super.onFormInit(form, o.data);
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.save(data);
        return o.success;
    }
    
    async onDialogReload() {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.reload();
        return o.success;
    }

}