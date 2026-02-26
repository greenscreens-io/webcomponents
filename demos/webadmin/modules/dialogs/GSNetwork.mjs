/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSUtil } from '../../../../modules/base/GSUtil.mjs';
import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSNetwork class
 * @module dialogs/GSNetwork
 */
export class GSNetwork extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-network');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Netowrk Options";
        me.template = "//dialogs/network.html";
    }

    async onData(data) {

        data.restart = GSUtil.asNum(data.restart) === 1;
        data.redirect = GSUtil.asNum(data.redirect) === 1;
        data.nodes = GSUtil.asNum(data.nodes) === 1;

        const o = DEMO ? DEMO : await io.greenscreens.Server.setInterface(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getInterface();
        o.data.restart = o.data.restart ? '1' : '0';
        return o.data;
    }    
}