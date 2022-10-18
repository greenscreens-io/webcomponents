/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSNetwork class
 * @module dialogs/GSNetwork
 */
import GSDialog from './GSDialog.mjs';

export default class GSNetwork extends GSDialog {

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

    async loadData() {
        const me = this;
        const o = await io.greenscreens.Server.getInterface();
        o.data.restart = 0;
        if (!o.success) return me.inform(false, o.msg);
        return o.data;
    }

    async onConfirm(data) {
        const me = this;
        data.restart = parseInt(data.restart) === 1;
        data.redirect = parseInt(data.redirect) === 1;
        data.nodes = parseInt(data.nodes) === 1;
        const o = await io.greenscreens.Server.setInterface(data);
        me.inform(o.success, o.success ? 'Data saved!' : o.msg);
        return o.success;
    }     

}