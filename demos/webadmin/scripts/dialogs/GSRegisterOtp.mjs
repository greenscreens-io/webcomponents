/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSRegisterOtp class
 * @module dialogs/GSRegisterOtp
 */
 import GSDialog from './GSDialog.mjs';

export default class GSRegisterOtp extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-otpreg', GSRegisterOtp);
        Object.seal(GSRegisterOtp);
    }

    get dialogTemplate() {
        return '//dialogs/otp.html';
    }
    
    get dialogTitle() {
        return 'Register OTP';
    }
}