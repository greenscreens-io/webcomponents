/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSOtpOptions class
 * @module dialogs/GSOtpOptions
 */
import GSDialog from './GSDialog.mjs';

export default class GSOtpOptions extends GSDialog {

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
        const me = this;
        const o = {success: true, data : {}};
        if (!o.success) return me.inform(false, o.msg);
        return o.data;
    }

    async onData(data) {
        const me = this;
        const o = {success: true, data : {}};
        me.inform(o.success, o.success ? 'Data saved!' : o.msg);
        return o.success;
    }   

}