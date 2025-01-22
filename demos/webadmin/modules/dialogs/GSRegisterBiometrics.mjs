/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../utils/Utils.mjs';
import { WebAuthn } from '../utils/WebAuthn.mjs';
import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSRegisterBiometrics class
 * @module dialogs/GSRegisterBiometrics
 */
export class GSRegisterBiometrics extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-bioreg');
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "SerRegister Biometric";
        me.template = "//dialogs/register-bio.html";
    }

    async beforeOpen() {

        const me = this;

        if (DEMO) return Utils.inform(false, 'Not supported in DEMO mode!');

        if (!WebAuthn.isAllowed()) {
            const msg = 'FIDO2 allowed only on secured url <br>and valid domain name!'
            me.body = msg;
            return Utils.inform(false, msg);
        }

        return true;
    }

    async onData() {
        const params = { uuid: 'ADMIN', host: 'ADMIN', user: 'ADMIN' };
        params.appID = 0;
        params.ipAddress = Tn5250.opt.ip;
        try {
            const o = await WebAuthn.register(params);
            console.log(o);
            me.body = 'Biometric Web Admin login activated!';
        } catch (e) {
            me.body = Utils.handleError(e) || 'Biometric Web Admin login not activated!';
        }
        return true;
    }
}