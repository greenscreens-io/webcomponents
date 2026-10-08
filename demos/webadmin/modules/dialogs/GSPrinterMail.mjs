/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSPrinterMail class
 * @module dialogs/GSPrinterMail
 */
import { GSAttr, GSDOM, GSUtil } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSPrinterMail extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-printer-mail', GSPrinterMail);
        Object.seal(GSPrinterMail);
    }

    #data = null;

    get dialogTemplate() {
        return '//dialogs/printer-mail.html';
    }

    get dialogTitle() {
        return 'Printer Mail';
    }

	get device() {
	    return GSDOM.query(this, 'input[name="printerName"]');
	}
	
    onReady() {
        super.onReady();
        const me = this;
		requestAnimationFrame(async () => {
		    await GSUtil.timeout(250);
		    me.attachEvent(me.device, 'blur', me.#onDevice.bind(me));
		});
    }
		
    open(data) {
        const me = this;
        me.#data = Object.assign({}, data);
        me.#data.host = me.#data.name;
        me.form.reset();
        super.open(me.#data);
    }

    async onFormInit(form) {
        super.onFormInit(form, this.#data);
    }

    async onData(data) {
        const me = this;
        me.waiter.open();
        let success = false;
        try {
            me.visible = false;
			const o = me.form.data;
            const res = DEMO ? DEMO : await io.greenscreens.system.Mail.register(o.uuid, o.host, o.printerName, o.fromMail, o.toMail);
            success = res.success;
            if (success) super.onData(data);
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