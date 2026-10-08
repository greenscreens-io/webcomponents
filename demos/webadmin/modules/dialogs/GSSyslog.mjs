/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSSystem class
 * @module dialogs/GSSystem
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSSyslog extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-syslog', GSSyslog);
        Object.seal(GSSyslog);
    }

    onReady() {
        super.onReady();
        if (this.large) this.large();
    }

    get dialogTemplate() {
        return '//dialogs/syslog.html';
    }

    get dialogTitle() {
        return 'Syslog Options';
    }

    async onFormInit(form) {
        const o = DEMO ? DEMO : await io.greenscreens.system.Syslog.load();
        super.onFormInit(form, o.data);
    }
    
    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.system.Syslog.save(data);
        super.onData();
        return o.success;
    }

}