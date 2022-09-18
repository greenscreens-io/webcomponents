/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSRegisterBiometrics class
 * @module dialogs/GSRegisterBiometrics
 */
 import GSDialog from './GSDialog.mjs';

export default class GSRegisterBiometrics extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-bioreg', GSRegisterBiometrics);
        Object.seal(GSRegisterBiometrics);
    }

    get dialogTemplate() {
        return '//dialogs/biometric.html';
    }
    
    get dialogTitle() {
        return 'Register Biometric';
    }    
    
}