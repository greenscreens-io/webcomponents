/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading SessionsUI class
 * @module SessionsUI
 */

import BaseUI from "./BaseUI.mjs"

/**
 * SessionsUI handles session template elements
 * @class
 * @extends {BaseUI}
 */
class SessionsUI extends BaseUI {

    static {
        customElements.define('gs-ext-sessions', SessionsUI);
        Object.seal(SessionsUI);
    }

    async getTemplate(val = '') {
        return super.getTemplate('//sessions.html');
    }

    constructor() {
        super();
        if (self.GS_DEV_MODE) self._SessionsUI = this;
    }

    /**
     * Table record action - start terminal session
     * @param {*} e 
     */
    async start(e) {

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
