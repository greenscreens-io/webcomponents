/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import { GSAttr, GSDOM, GSLoader, GSDialog, GSUtil } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
import Utils from '../utils/Utils.mjs';

export default class GSAsbtractDialog extends GSDialog {

    static {
        customElements.define('gs-admin-dialog', GSAsbtractDialog);
        Object.seal(GSAsbtractDialog);
    }

    #data = null;

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.cssHeader = 'p-3';
        //me.cssTitle = 'fs-5 fw-bold text-muted';
        //me.cssBody = 'p-0';
    }

    get dialogTemplate() {
        return GSAttr.get(this, 'content', '');
    }

    get dialogTitle() {
        return GSAttr.get(this, 'title', '');
    }

    /**
     * Override GSDialog method, to attach UI slot
     */
    async onBeforeReady() {

        await super.onBeforeReady();
        const me = this;

        me.on('data', me.#onFormData.bind(me));
        me.on('error', me.#onFormError.bind(me));

        if (me.dialogTemplate) {
            let tpl = await GSLoader.getTemplate(me.dialogTemplate);
			const hasNotify = tpl.indexOf('gs-notification') > -1;
            tpl = GSDOM.parse(tpl);
            Array.from(tpl.body.children).forEach(el => {
                if (!el.slot) el.slot="body";
                GSDOM.appendChild(me, el);
            });   
            GSDOM.appendChild(me, tpl.body.firstElementChild);
			if (!hasNotify) {
				tpl = GSDOM.parse('<gs-notification id="notification"></gs-notification>');
				tpl.body.firstElementChild.slot = 'extra';
				GSDOM.appendChild(me, tpl.body.firstElementChild);	
            }
        }
        if (me.dialogTitle) me.title = me.dialogTitle;
    }

	open(data) {
		this.#data = data;
		super.open(data);
	}

    /**
     * Used by inherited dialogs to process confirmed dialog form
     * @param {*} data 
     */
    async onData(data) {
        return true;
    }

    /**
     * Wait dialog
     */
    get waiter() {
        return Utils.waiter;
    }

	get notify() {
		return GSDOM.query(this, 'gs-notification');
	}
	
	afterOpen() {
		const me = this;
		me.reset();
	    me.#update(me.#data);
	}
	
	async onFormInit(form, data) {
		// quick fix
	  await GSUtil.timeout(1000);
	  super.onFormInit(form, data);
    }

    /**
     * Update dialog forms 
     */
    #update(data) {
        if (GSUtil.isJson(data)) {
            const me = this;
            me.reset(data);
            me.emit('change');
        }
    }

    #onFormError(e) {
        Utils.inform(false, 'Some fields are invalid!');
    }

    async #onFormData(e) {
        // GSEvents.prevent(e);
        const me = this;
        const generic = me.constructor === GSAsbtractDialog;
		if (generic) return;

        let sts = false;
        try {
            me.disable();
            sts = await me.onData(e.detail.data);
        } catch (e) {
            Utils.handleError(e);
        } finally {
            me.enable();
            if (sts) {
                me.close();
                //Utils.notify.secondary('', 'Changes applied!', false, 0.75);
            }
        }
    }

    onError(e) {
        Utils.handleError(e);
    }

}
