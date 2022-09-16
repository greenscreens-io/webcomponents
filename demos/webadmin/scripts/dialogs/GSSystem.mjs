/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSSystem class
 * @module dialogs/GSSystem
 */
 import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSSystem extends GSModal {

    static {
        customElements.define('gs-admin-dialog-system', GSSystem);
        Object.seal(GSSystem);
    }
    
    constructor() {
        super();
        this.visible = true;
    }
}