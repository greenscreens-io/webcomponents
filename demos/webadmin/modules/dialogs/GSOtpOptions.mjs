/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSOtpOptions class
 * @module dialogs/GSOtpOptions
 */
import GSAdminDialog from './GSAdminDialog.mjs';

export default class GSOtpOptions extends GSAdminDialog {

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

    async onOpen() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getOtp();
        return o.data;
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.saveOTP(data);
        return o.success;
    }

}