/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSSystem class
 * @module dialogs/GSSystem
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSSystem extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-system', GSSystem);
        Object.seal(GSSystem);
    }

    onReady() {
        super.onReady();
        if (this.large) this.large();
    }

    get dialogTemplate() {
        return '//dialogs/system.html';
    }

    get dialogTitle() {
        return 'System Options';
    }

    async onFormInit(form) {
        const o = DEMO ? DEMO : await io.greenscreens.Configs.getConfig();
        super.onFormInit(form, o.data);
    }
    
    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Configs.setConfig(data);
        super.onData();
        return o.success;
    }

}