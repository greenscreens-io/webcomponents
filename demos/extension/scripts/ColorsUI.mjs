/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading ColorsUI class
 * @module ColorsUI
 */

import BaseUI from "./BaseUI.mjs"

/**
 * ColorsUI handles colors template elements
 * @class
 * @extends {BaseUI}
 */
class ColorsUI extends BaseUI {

    static {
        customElements.define('gs-ext-colors', ColorsUI);
        Object.seal(ColorsUI);
    }

    async getTemplate(val = '') {
        return super.getTemplate('//colors.html');
    }

    constructor() {
        super();
        if (self.GS_DEV_MODE) self._ColorsUI = this;
    }

    /**
     * Table record action - export to CSS
     * @param {*} e 
     */
    async export(e) {

    }

    /**
     * Handle remote record create
     * @param {*} data 
     * @returns {boolean|Error}
     */
    async onCreate(data) {
        return true;
    }

    /**
     * Handle remote record update
     * @param {*} data 
     * @returns {boolean|Error}
     */
    async onUpdate(data) {
        return true;
    }

    /**
     * Handle remote record remove
     * @param {*} data 
     * @returns {boolean|Error}
     */
    async onRemove(data) {
        return true;
    }
    
}
