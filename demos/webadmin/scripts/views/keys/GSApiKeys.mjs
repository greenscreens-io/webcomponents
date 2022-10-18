/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSApiKeys class
 * @module views/GSApiKeys
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSApiKeys extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-apikeys', GSApiKeys);
        Object.seal(GSApiKeys);
    }

    onReady() {
        super.onReady();
        this.modal.large();
    }

    async getTemplate() {
        return super.getTemplate('//views/keys-api.html');
    }

    async onLoad() {
        const o = {success: false};
        return o.success ? o.data : false;
    }
}