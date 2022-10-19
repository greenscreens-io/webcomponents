/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSSystem class
 * @module dialogs/GSSystem
 */
import GSDialog from './GSDialog.mjs';

export default class GSSystem extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-system', GSSystem);
        Object.seal(GSSystem);
    }

    onReady() {
        super.onReady();
        this.large();
    }

    get dialogTemplate() {
        return '//dialogs/system.html';
    }

    get dialogTitle() {
        return 'System Options';
    }

    async onOpen() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getConfig();
        return o.data;
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.setConfig(data);
        return o.success;
    }

    async reloadKerberos() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.reloadKerberors();
        return o.success;
    }

}