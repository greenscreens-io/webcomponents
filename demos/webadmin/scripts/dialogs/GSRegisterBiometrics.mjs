/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSRegisterBiometrics class
 * @module dialogs/GSRegisterBiometrics
 */
 import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSRegisterBiometrics extends GSModal {

    static {
        customElements.define('gs-admin-dialog-bioreg', GSRegisterBiometrics);
        Object.seal(GSRegisterBiometrics);
    }

    constructor() {
        super();
        this.visible = true;
    }
    
}