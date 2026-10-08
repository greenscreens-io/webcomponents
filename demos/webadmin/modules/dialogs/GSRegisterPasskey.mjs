/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSRegisterBiometrics class
 * @module dialogs/GSRegisterBiometrics
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';
import WebAuthn from '../utils/WebAuthn.mjs';
import Utils from '../utils/Utils.mjs';

/**
 * Register PassKey fro WebAdmin console
 */
export default class GSRegisterPasskey extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-passkey', GSRegisterPasskey);
        Object.seal(GSRegisterPasskey);
    }

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.align = 'center';
        me.cancelable = false;
    }

    get dialogTemplate() {
        return '//dialogs/register-passkey.html';
    }

    get dialogTitle() {
        return 'Register Passkey';
    }

    async beforeOpen() {

        const me = this;

        if (DEMO) return Utils.inform(false, 'Not supported in DEMO mode!');

        if (!WebAuthn.isAllowed()) {
            const msg = 'Passkey allowed only on secured url <br>and valid domain name!'
            me.body = msg;
            return Utils.inform(false, msg);
        }

        return true;
    }

    async onData() {
        const me = this;
        const params = { uuid: 'ADMIN', host: 'ADMIN', user: 'ADMIN' };
        params.appID = 0;
        params.ipAddress = Tn5250.opt.ip;
        try {
            const o = await WebAuthn.register(params);
            console.log(o);
            me.body = 'Passkey Web Admin login activated!';
        } catch (e) {
            me.body = Utils.handleError(e) || 'Passkey Web Admin login not activated!';
        }

        return true;
    }

}