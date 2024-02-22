/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading IOActions class
 * @module IOActions
 */

import { GSElement } from "../../../modules/GSElement.mjs";
import { GSFunction } from "../../../modules/base/GSFunction.mjs";

/**
 * IOActions handles dynmic actions from side bar menu
 * @class
 * @extends {GSElement}
 */
class IOActions extends GSElement {

    constructor() {
        super();
        this.flat = true;
    }

    firstUpdated() {
        super.firstUpdated();
        const me = this;
        me.attachEvent(me, 'action', me.#onAction.bind(me));
    }

    /**
     * Listener for triggered "action" events 
     * @param {Event} e 
     */
    #onAction(e) {
        const action = e.detail.action || e.detail;
        if (GSFunction.isFunction(this[action])) this[action](e);
    }

    /**
     * Handle settings import event
     */
    async import() {
        console.log('on import');
    }

    /**
     * Handle settings export event
     */    
    async export() {
        console.log('on export');
    }

    static {
        GSElement.define('gs-actions', IOActions);
    }
}

