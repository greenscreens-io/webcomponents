/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSRegisterOtp class
 * @module dialogs/GSRegisterOtp
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';
import Utils from '../utils/Utils.mjs';
import {GSDOM} from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

export default class GSRegisterOtp extends GSAsbtractDialog {

    static #URL = '/barcode/generator?group=Two%20Dimensional&type=QR&composite=&zoom=4&format=png&eci=-1&attGS1=0&attQR1=&attQR2=3&b64=';

    static {
        customElements.define('gs-admin-dialog-otpreg', GSRegisterOtp);
        Object.seal(GSRegisterOtp);
    }

    constructor() {
        super();
        const me = this;
        me.cancelable = false;
        me.align = 'center';
    }

    get dialogTemplate() {
        return '//dialogs/register-otp.html';
    }

    get dialogTitle() {
        return 'Register OTP';
    }

    get scratch() {
        return GSDOM.query(this, '#scratch');
    }

    get qrcode() {
        return GSDOM.query(this, '#qrcode');
    }

    get token() {
        return GSDOM.query(this, '#token');
    }

    getUrl(token) {
        const b64 = self.btoa(token);
        return `${location.origin}${GSRegisterOtp.#URL}${b64}`;
    }

    async onFormInit(form) {
        if (DEMO) return;
        const o = await io.greenscreens.OAuth.register();
        const me = this;
        me.#download(o.data);
        me.#update(o.data);
        super.onFormInit(form, o.data);
    }

    async beforeOpen() {
        return DEMO ? Utils.inform(false, 'Not available in DEMO!') : true;
    }

    async onData() {
        return true;
    }

    #update(o) {
        const me = this;
        const url = me.getUrl(o.url);
        me.qrcode.parentElement.href = url;
        me.qrcode.src = url;
        me.qrcode.title = o.url;
        me.token.innerHTML = o.key.replaceAll('=', '');
        me.scratch.innerHTML = o.scratchCodes.join('&nbsp;');
    }

    #download(o) {
        const alt = o.scratchCodes;
        const list = [
            'Green Screens Admin OTP Codes',
            '\n\n',
            'User : ',
            o.userName,
            '\n\n',
            'Key : ',
            o.key.replaceAll('=', ''),
            '\n\n',
            'Recovery Keys : ',
        ];

        alt.every((v) => {
            list.push(v);
            list.push(' ');
            return true;
        });

        Utils.download('Green_Screens_Admin_OTP.txt', list.join(''));
    }
}