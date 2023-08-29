/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSNetwork class
 * @module dialogs/GSNetwork
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSNetwork extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-network', GSNetwork);
        Object.seal(GSNetwork);
    }

    get dialogTemplate() {
        return '//dialogs/network.html';
    }

    get dialogTitle() {
        return 'Netowrk Options';
    }

    async onFormInit(form) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getInterface();
        o.data.restart = o.data.restart ? '1' : '0';
        super.onFormInit(form, o.data);
    }

    async onData(data) {

        data.restart = parseInt(data.restart) === 1;
        data.redirect = parseInt(data.redirect) === 1;
        data.nodes = parseInt(data.nodes) === 1;

        const o = DEMO ? DEMO : await io.greenscreens.Server.setInterface(data);
        return o.success;
    }

}