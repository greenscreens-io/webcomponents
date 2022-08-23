/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading SettingsUI class
 * @module SettingsUI
 */

import GSElement from "../../../modules/base/GSElement.mjs";
import GSUtil from "../../../modules/base/GSUtil.mjs";

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
        me.attachEvent(me, 'action', me.#onAction.bind(me));
        super.onReady();
    }

    #onAction(e) {
        const action = e.detail.action;
        if (GSUtil.isFunction(this[action])) this[action](e);
    }

}
