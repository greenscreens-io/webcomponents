/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading SettingsUI class
 * @module SettingsUI
 */

import { GSElement } from "../../../modules/GSElement.mjs";
import { GSDOM } from "../../../modules/base/GSDOM.mjs";

/**
 * SettingsUI handles session template elements
 * @class
 * @extends {GSElement}
 */
class SettingsUI extends GSElement {

    constructor() {
        super();
        this.className = 'w-100';
        this.template = '//views/settings.html';
        if (self.GS_DEV_MODE) self._SettingsUI = this;
    }

    renderUI() {
        return this.renderTemplate();
    }

	templateInjected() {
		const me = this;
        me.attachEvent(me, 'form', me.#onForm.bind(me));
	}

    async #onForm(e) {
        const form = e.detail.owner;
        const data = form.asJSON;
        
        if (!data) {
            return this.notify?.danger('', 'Not all required fields valid!');
        }

        // TODO save data        
        console.log(form.asJSON);
        
        this.notify?.warn('', 'Record updated!');
    }

    get notify() {
        return GSDOM.query('#notification');
    }

    static {
        GSElement.define('gs-ext-settings', SettingsUI);
    }

}

