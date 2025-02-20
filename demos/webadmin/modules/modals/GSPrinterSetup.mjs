/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

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

    templateInjected() {
        super.templateInjected();
        const me = this;
        me.attachEvent(me.form, 'change', me.#onHPT.bind(me));
    }

    open(data) {
        const me = this;
        //data = Object.assign({}, data);
        data = {uuid : data.uuid, host:data.name};
        // me.form.reset();
        // me.#update(true);
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
        if (e.target.name === "hostTransform") {
            this.#update(e.target.value !== '1');
        }
    }

    #update(sts) {
        this.form.queryAll("[data-group='true']").forEach(el => el.disabled = sts);
    }

}