/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading SettingsUI class
 * @module SettingsUI
 */

import { GSFormElement } from "../../../../modules/components/Form.mjs";
import { GSDOM } from "../../../../modules/base/GSDOM.mjs";

/**
 * SettingsUI handles session template elements
 * @class
 * @extends {GSElement}
 */
class SettingsView extends GSFormElement {

    constructor() {
        super();
        const me = this;
        me.className = 'w-100';
        me.template = '//views/settings.html';
        me.autosubmit = true;
        if (self.GS_DEV_MODE) self._SettingsView = this;
    }

	firstUpdated() {
		const me = this;
        me.attachEvent(me, 'formsubmit', me.#onForm.bind(me));
	}

    async #onForm(e) {
        const data = e.detail.data; //form.asJSON;
        
        if (!data) {
            return this.danger('Not all required fields valid!');
        }

        // TODO save data        
        console.log(data);
        
        this.warn('Record updated!');
    }

    danger(msg = '') {
        if (msg) this.notify?.danger('', msg);
    }

    warn(msg = '') {
        if (msg) this.notify?.warn('', msg);
    }

    get notify() {
        return GSDOM.query('#notification');
    }

    static {
        GSFormElement.define('gs-ext-settings', SettingsView);
    }

}

