/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSPrinterReset class
 * @module dialogs/GSPrinterReset
 */
 import GSDialog from './GSDialog.mjs';

 export default class GSPrinterReset extends GSDialog {

    #data = null;

    static {
        customElements.define('gs-admin-dialog-printer-reset', GSPrinterReset);
        Object.seal(GSPrinterReset);
    }

    get dialogTemplate() {
        return '//dialogs/printer-reset.html';
    }

    get dialogTitle() {
        return 'Printer Reset';
    }

    async open(data) {
        const me = this;
        me.#data = {uuid:data.uuid, host : data.name};
        super.open();
    }

    async loadData() {
        return this.#data;
    }

    async onConfirm(data) {
        const me = this;
        data.host = data.name;
        const o = await io.greenscreens.Printer.reset(data);
        me.inform(o.success, o.success ? 'Printer reset complete!' : o.msg.replace(/\n/g,'<br>'));
        return o.success;
    }     

}