/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSOtpOptions class
 * @module dialogs/GSOtpOptions
 */
export class GSOtpOptions extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-otpopt');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "OTP Options";
        me.template = "//dialogs/otp-options.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Server.saveOTP(data);
        return o.success;
    }

    async loadDefaults() {
        const o = DEMO ? DEMO : await io.greenscreens.Server.getOtp();
        return o.data;
    }

}