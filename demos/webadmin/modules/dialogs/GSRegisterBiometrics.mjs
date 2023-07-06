/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSRegisterBiometrics class
 * @module dialogs/GSRegisterBiometrics
 */
import GSAdminDialog from './GSAdminDialog.mjs';
import WebAuthn from '../utils/WebAuthn.mjs';
import Utils from '../utils/Utils.mjs';

export default class GSRegisterBiometrics extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-bioreg', GSRegisterBiometrics);
        Object.seal(GSRegisterBiometrics);
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.align = 'center';
        me.cancelable = false;
    }

    get dialogTemplate() {
        return '//dialogs/register-bio.html';
    }

    get dialogTitle() {
        return 'Register Biometric';
    }

    async onOpen() {

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