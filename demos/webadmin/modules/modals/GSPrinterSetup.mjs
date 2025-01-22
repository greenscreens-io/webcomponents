/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSAttr } from '../../../../modules/base/GSAttr.mjs';
import { GSAsbtractDialog } from '../dialogs/GSAsbtractDialog.mjs';

/**
 * A module loading GSPrinterSetup class
 * @module dialogs/GSPrinterSetup
 */
export default class GSPrinterSetup extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-printer-setup');
    }
    
    constructor() {
        super();
        const me = this;
        me.template = "//modals/printer-setup.html";
        me.title = "Printer Setup";
    }

    get hpt() {
        return this.query('select[name="hostTransform"]');
    }

    templateInjected() {
        super.templateInjected();
        const me = this;
        me.attachEvent(me.form, 'change', me.#onHPT.bind(me));
    }

    open(data) {
        const me = this;
        data = Object.assign({}, data);
        data.host = data.name;
        delete data.drawer1;
        delete data.drawer2;
        me.form.reset();
        me.#update(true);
        super.open(data);
    }

    async onData(data) {
        const me = this;
        me.waiter.open();
        let success = false;
        try {
            me.visible = false;
            data.hostTransform = parseInt(data.hostTransform) === 1;
            const o = DEMO ? DEMO : await io.greenscreens.Printer.setup(data);
            success = o.success;
        } catch (e) {
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
        const qry = '[data-group="true"] input, [data-group="true"] select';
        this.queryAll(qry).forEach(el => GSAttr.toggle(el, 'disabled', sts));
    }

}