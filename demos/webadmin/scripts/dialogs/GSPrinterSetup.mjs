/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSPrinterSetup class
 * @module dialogs/GSPrinterSetup
 */
import GSDialog from './GSDialog.mjs';

export default class GSPrinterSetup extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-printer-setup', GSPrinterSetup);
        Object.seal(GSPrinterSetup);
    }

    #data = null;

    get dialogTemplate() {
        return '//dialogs/printer-setup.html';
    }

    get dialogTitle() {
        return 'Printer Setup';
    }

    open(data) {
        const me = this;
        me.#data = Object.assign({}, data);
        me.#data.host = me.#data.name;
        super.open();
    }

    async onOpen() {
        return this.#data;
    }

    async onData(data) {
        const me = this;
        me.waiter.open();
        let success = false;
        try {
            data.hostTransform = parseInt(data.hostTransform) === 1;
            const o = DEMO ? DEMO :  await io.greenscreens.Printer.setup(data);
            success = o.success;
        } finally {
            me.waiter.close();
        }
        return success;
    }    

}