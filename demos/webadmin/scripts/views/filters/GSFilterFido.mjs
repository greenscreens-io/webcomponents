/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSFilterFido class
 * @module views/GSFilterFido
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSFilterFido extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-filterfido', GSFilterFido);
        Object.seal(GSFilterFido);
    }

    async getTemplate() {
        return super.getTemplate('//views/filter-fido.html');
    }

    onReady() {
        super.onReady();
        this.modal.large();
    }

    async onLoad() {
        const o = {success: false};
        return o.success ? o.data : false;
    }
}