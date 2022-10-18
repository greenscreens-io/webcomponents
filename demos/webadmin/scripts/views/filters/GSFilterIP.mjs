/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSFilterIP class
 * @module views/GSFilterIP
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSFilterIP extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-filterip', GSFilterIP);
        Object.seal(GSFilterIP);
    }

    onReady() {
        super.onReady();
        this.modal.large();
    }

    async getTemplate() {
        return super.getTemplate('//views/filter-ip.html');
    }

    async onLoad() {
        const o = {success: false};
        return o.success ? o.data : false;
    }

}