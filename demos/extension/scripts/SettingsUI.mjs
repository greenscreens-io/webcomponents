/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading SettingsUI class
 * @module SettingsUI
 */

import GSElement from "../../../modules/base/GSElement.mjs";

/**
 * SettingsUI handles session template elements
 * @class
 * @extends {GSElement}
 */
class SettingsUI extends GSElement {

    static {
        customElements.define('gs-ext-settings', SettingsUI);
        Object.seal(SettingsUI);
    }

    async getTemplate(val = '') {
        return super.getTemplate('//views/settings.html');
    }

    constructor() {
        super();
        this.className = 'w-100';
        if (self.GS_DEV_MODE) self._SettingsUI = this;
    }

    onReady() {
        const me = this;
        me.attachEvent(me, 'form', me.#onForm.bind(me));
        super.onReady();
    }

    #onForm(e) {
        const data = e.detail.data;
        if (e.detail.valid) {
            // TODO save data
            console.log(data);
            GSComponents.get('notification').warn('', 'Record updated!');
        } else {
            GSComponents.get('notification').danger('', 'Not all required fields valid!');
        }
    }

}

