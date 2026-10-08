/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSNetwork class
 * @module dialogs/GSNetwork
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSProxy extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-proxy', GSProxy);
        Object.seal(GSProxy);
    }

    get dialogTemplate() {
        return '//dialogs/proxy.html';
    }

    get dialogTitle() {
        return 'Proxy Options';
    }

    async onFormInit(form) {
        const o = DEMO ? DEMO : await io.greenscreens.system.Proxy.load();
        o.data.restart = o.data.restart ? '1' : '0';
        super.onFormInit(form, o.data);
    }

    async onData(data) {

        data.restart = parseInt(data.restart) === 1;
        data.redirect = parseInt(data.redirect) === 1;
        data.nodes = parseInt(data.nodes) === 1;

        const o = DEMO ? DEMO : await io.greenscreens.system.Proxy.save(data);
        super.onData();
        return o.success;
    }

}