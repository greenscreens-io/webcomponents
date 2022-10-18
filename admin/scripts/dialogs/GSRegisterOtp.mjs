/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSRegisterOtp class
 * @module dialogs/GSRegisterOtp
 */
import GSDialog from './GSDialog.mjs';
import Utils from '../util.mjs';
import GSDOM from '../../../modules/base/GSDOM.mjs';

export default class GSRegisterOtp extends GSDialog {

    static #QR = '/barcode/generator?group=Two%20Dimensional&type=QR&composite=&zoom=4&format=png&eci=26&attGS1=0&attQR1=&attQR2=3&b64=';

    static {
        customElements.define('gs-admin-dialog-otpreg', GSRegisterOtp);
        Object.seal(GSRegisterOtp);
    }

    onReady() {
        super.onReady();
        const me = this;
        me.cancelable = false;
        me.align = 'center';
    }

    get dialogTemplate() {
        return '//dialogs/register-otp.html';
    }

    get dialogTitle() {
        return 'Admin OTP Access';
    }

    get #key() {
        return GSDOM.query(this, '#key');
    }

    get #qrcode() {
        return GSDOM.query(this, '#qrcode');
    }

    get #qlink() {
        return GSDOM.query(this, '#qlink');
    }

    get #scratch() {
        return GSDOM.query(this, '#scratchcodes');
    }

    async loadData() {
        const me = this;

        const o = await io.greenscreens.OAuth.register();
        if (!o.success) return me.inform(false, o.msg);

        me.#doOTPPopup(o.data);
        me.#doOTPQR(o.data);
        me.#doOTPDownload(o.data);

        return o.data;
    }

    #doOTPPopup(data) {
        const me = this;
        me.#key.innerHTML = data.key;
        me.#scratch.innerHTML = data.scratchCodes?.join('&nbsp;&nbsp;');
    }

    async #doOTPQR(data) {
        const me = this;
        const b64 = btoa(data.url);
        const url = `${location.origin}${GSRegisterOtp.#QR}${b64}`;
        me.#qrcode.src = url;
        me.#qrcode.title = url;
        me.#qlink.href = url;
    }

    async #doOTPDownload(data) {
        if (!data) return;
        const alt = data.scratchCodes;
        const list = [
            'Green Screens Admin OTP Codes',
            '\n\n',
            'User : ',
            data.userName,
            '\n\n',
            'Key : ',
            data.key,
            '\n\n',
            'Recovery Keys : ',
        ];
        alt.every(function (v) {
            list.push(v);
            list.push(' ');
            return true;
        });

        Utils.download('Green_Screens_Admin_OTP.txt', list.join(''));
    }

}