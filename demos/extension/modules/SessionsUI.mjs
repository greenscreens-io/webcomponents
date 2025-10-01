/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading SessionsUI class
 * @module SessionsUI
 */

import { BaseUI } from "./BaseUI.mjs"

/**
 * SessionsUI handles session template elements
 * @class
 * @extends {BaseUI}
 */
class SessionsUI extends BaseUI {
    
    constructor() {
        super();
        this.template = '//views/sessions.html';
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
     * @returns {boolean}
     * @throws {Error}
     */
    async onCreate(data) {
        return true;
    }

    /**
     * Handle remote record update
     * @param {*} data 
     * @returns {boolean}
     * @throws {Error}
     */
    async onUpdate(data) {
        return true;
    }

    /**
     * Handle remote record remove
     * @param {*} data 
     * @returns {boolean}
     * @throws {Error}
     */
    async onRemove(data) {
        return true;
    }

    static {
        BaseUI.define('gs-ext-sessions', SessionsUI);
    }    
}

