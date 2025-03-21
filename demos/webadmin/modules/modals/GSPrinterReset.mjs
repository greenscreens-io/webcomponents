/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSAsbtractDialog } from '../dialogs/GSAsbtractDialog.mjs';

/**
 * A module loading GSPrinterReset class
 * @module dialogs/GSPrinterReset
 */
export class GSPrinterReset extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-printer-reset');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//modals/printer-reset.html";
        me.title = "Printer Reset";
    }

    open(data) {
        const me = this;
        data.host = data.name;
        super.open(data);
    }

    async onData(data) {
        const me = this;
        me.waiter.open();
        let success = false;
        try {
            me.visible = false;
            const o = DEMO ? DEMO : await io.greenscreens.Printer.reset(data);
            success = o.success;
        } catch (e) {
            me.visible = true;
            throw e;
        } finally {
            me.waiter.close();
        }
        return success;
    }

}