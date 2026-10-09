/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSDOM } from '../../../../modules/base/GSDOM.mjs';
import { GSAsbtractDialog } from '../dialogs/GSAsbtractDialog.mjs';

/**
 * A module loading GSPrinterMailing class
 * @module dialogs/GSPrinterMailing
 */
export default class GSPrinterMailing extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-printer-mail');
    }
    
    constructor() {
        super();
        const me = this;
        me.template = "//modals/printer-mail.html";
        me.title = "Printer Mailing";
    }

   	get device() {
	    return GSDOM.query(this, 'input[name="printerName"]');
	}

    templateInjected() {
        super.templateInjected();
        const me = this;
		requestAnimationFrame(async () => {
		    await GSUtil.timeout(250);
		    me.attachEvent(me.device, 'blur', me.#onDevice.bind(me));
		});
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
            const res = DEMO ? DEMO : await io.greenscreens.system.Mail.register(data.uuid, data.host, data.printerName, data.fromMail, data.toMail);
            success = res.success;
        } catch (e) {
            me.visible = true;
            throw e;
        } finally {
            me.waiter.close();
        }
        return success;
    }

	async #onDevice(e) {
		const me = this;
		const o = me.form.data;
		if (o.toMail.trim()) return;
		if (o.printerName.trim()) {
			try {
				me.disable();
				const res = DEMO ? DEMO : await io.greenscreens.system.Mail.retrieve(o.uuid, o.host, o.printerName);
				if (res.success) {
					me.form.data = Object.assign(o, res.data);
				}
			} finally {
				me.enable();
			}
		}
	}

}