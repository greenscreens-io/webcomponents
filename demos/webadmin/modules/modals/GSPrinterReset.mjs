/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSAttr } from '../../../../modules/base/GSAttr.mjs';
import { GSUtil } from '../../../../modules/base/GSUtil.mjs';
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

    get hpt() {
        return this.form?.field('hostTransform');
    }

    firstUpdated() {
        const me = this;
        requestAnimationFrame(async () => {
            await GSUtil.timeout(250);
            me.attachEvent(me.hpt, 'change', me.#onHPT.bind(me));
        });        
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


    #onHPT(e) {
        this.#update(e.target.value !== '1');
    }

    #update(sts) {
        this.form?.queryAll('[data-group="true"]', true, true)
            .map(el => el.field || el)
            .forEach(el => GSAttr.toggle(el, 'disabled', sts));
    }    
}