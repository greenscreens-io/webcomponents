/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginDefaults class
 * @module dialogs/GSLoginDefaults
 */
 import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSLoginDefaults extends GSModal {

    static {
        customElements.define('gs-admin-dialog-logindefs', GSLoginDefaults);
        Object.seal(GSLoginDefaults);
    }

    constructor() {
        super();
        this.visible = true;
    }
    
    
}