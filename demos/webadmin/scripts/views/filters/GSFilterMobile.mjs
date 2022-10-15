/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSFilterMobile class
 * @module views/GSFilterMobile
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSFilterMobile extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-filtermobile', GSFilterMobile);
        Object.seal(GSFilterMobile);
    }

    onReady() {
        super.onReady();
        this.modal.large();
    }

    async getTemplate() {
        return super.getTemplate('//views/filter-mobile.html');
    }

    async onLoad() {
        const o = {success: false};
        return o.success ? o.data : false;
    }

}