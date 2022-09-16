/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
 import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSLoginAdmin extends GSModal {

    static {
        customElements.define('gs-admin-dialog-loginadm', GSLoginAdmin);
        Object.seal(GSLoginAdmin);
    }

    constructor() {
        super();
        this.visible = true;
    }
    
    
}