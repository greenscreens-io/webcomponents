/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSBiometrics class
 * @module views/GSBiometrics
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSBiometrics extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-biometrics', GSBiometrics);
        Object.seal(GSBiometrics);
    }

    async getTemplate() {
        return super.getTemplate('//views/keys-bio.html');
    }

    async onLoad() {
        const o = {success: false};
        return o.success ? o.data : false;
    }
}