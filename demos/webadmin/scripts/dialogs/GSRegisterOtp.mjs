/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSRegisterOtp class
 * @module dialogs/GSRegisterOtp
 */
 import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSRegisterOtp extends GSModal {

    static {
        customElements.define('gs-admin-dialog-otpreg', GSRegisterOtp);
        Object.seal(GSRegisterOtp);
    }
    
    constructor() {
        super();
        this.visible = true;
    }
}