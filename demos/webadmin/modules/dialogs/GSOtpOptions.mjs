/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
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

    async onOpen() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getOtp();
        return o.data;
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.saveOTP(data);
        return o.success;
    }

}