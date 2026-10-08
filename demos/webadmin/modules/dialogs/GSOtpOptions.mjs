/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSOtpOptions class
 * @module dialogs/GSOtpOptions
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSOtpOptions extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-otpopt', GSOtpOptions);
        Object.seal(GSOtpOptions);
    }

    get dialogTemplate() {
        return '//dialogs/otp-options.html';
    }

    get dialogTitle() {
        return 'OTP Options';
    }

    async onFormInit(form) {
        const o = DEMO ? DEMO : await io.greenscreens.Configs.getOtp();
        super.onFormInit(form, o.data);
    }
    
    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Configs.saveOTP(data);
        super.onData();
        return o.success;
    }

}