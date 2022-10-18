/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSPrinterSetup class
 * @module dialogs/GSPrinterSetup
 */
import GSDOM from '../../../../modules/base/GSDOM.mjs';
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

    get hpt() {
        return GSDOM.query(this, 'select[name="hostTransform"]');
    }

    onReady() {
        super.onReady();
        const me =  this;
        requestAnimationFrame(async () =>{
            await GSUtil.timeout(250);
            me.attachEvent(me.hpt, 'change', me.#onHPT.bind(me));
        });
    }

    open(data) {
        const me = this;
        me.#data = Object.assign({}, data);
        me.#data.host = me.#data.name;
        delete me.#data.drawer1;
        delete me.#data.drawer2;
        me.form.reset();
        me.#update(true);
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
            me.visible = false;
            data.hostTransform = parseInt(data.hostTransform) === 1;
            const o = DEMO ? DEMO :  await io.greenscreens.Printer.setup(data);
            success = o.success;
        } catch(e) {
            me.visible = true;
            throw e;
        } finally {
            me.waiter.close();
        }
        return success;
    }    

    #onHPT(e) {
        this.#update(e.target.value !== '1');
    }

    #update(sts) {
        GSDOM.queryAll(this, '[data-hpt="true"]').forEach(el => GSAttr.toggle(el, 'disabled', sts));
    }

}