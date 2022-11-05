/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading SettingsUI class
 * @module SettingsUI
 */

import {GSElement} from "/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js";

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

    async #onForm(e) {
        const data = e.detail.data;
        if (e.detail.valid) {
            return GSComponents.get('notification').danger('', 'Not all required fields valid!');
        }

        // TODO save data        
        console.log(data);
        
        GSComponents.get('notification').warn('', 'Record updated!');
    }

}

