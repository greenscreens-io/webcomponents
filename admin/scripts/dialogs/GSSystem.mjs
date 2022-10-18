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

    async loadData() {
        const me = this;
        const o = await io.greenscreens.Server.getConfig();
        if (!o.success) return me.inform(false, o.msg);
        delete o.data.password;
        return o.data;
    }

    async onConfirm(data) {
        const me = this;
        const o = await io.greenscreens.Server.setConfig(data);
        me.inform(o.success, o.success ? 'Data saved!' : o.msg);
        return o.success;
    }   

}