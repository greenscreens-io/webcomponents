/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading ColorsUI class
 * @module ColorsUI
 */

import { BaseView } from "./BaseView.mjs";

/**
 * ColorsUI handles colors template elements
 * @class
 * @extends {BaseView}
 */
class ColorsView extends BaseView {

    constructor() {
        super();
        this.template = '//views/colors.html';
        if (self.GS_DEV_MODE) self._ColorsView = this;
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
        BaseView.define('gs-ext-colors', ColorsView);
    }
}

