/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSPrinterSetup class
 * @module dialogs/GSPrinterSetup
 */
import GSAttr from '../../../modules/base/GSAttr.mjs';
import GSDOM from '../../../modules/base/GSDOM.mjs';
import GSDialog from './GSDialog.mjs';

export default class GSPrinterSetup extends GSDialog {

    #data = null;

    static {
        customElements.define('gs-admin-dialog-printer-setup', GSPrinterSetup);
        Object.seal(GSPrinterSetup);
    }

    get dialogTemplate() {
        return '//dialogs/printer-setup.html';
    }

    get dialogTitle() {
        return 'Printer Setup';
    }

    get hpt() {
        return GSDOM.query(this, '#hostTransform');
    }

    get hptOptions() {
        return GSDOM.queryAll(this, 'input,select').filter(el => el.dataset.hpt == 'true');
    }

    onReady() {
        super.onReady();
        const me = this;
        setTimeout(() => {
            me.attachEvent(me.hpt, 'change', me.#onHPT.bind(me));
        }, 1000);
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
        data.hostTransform = parseInt(data.hostTransform) === 1;
        const o = await io.greenscreens.Printer.setup(data);
        me.inform(o.success, o.success ? 'Printer setup complete!' : o.msg.replace(/\n/g,'<br>'));
        return o.success;
    }     

    #onHPT(e) {
        this.hptOptions.forEach(el => GSAttr.toggle(el, 'disabled', e.target.value == '0'));
    }

}