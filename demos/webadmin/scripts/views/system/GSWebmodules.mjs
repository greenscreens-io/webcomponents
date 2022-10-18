/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSWebmodules class
 * @module views/GSWebmodules
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSWebmodules extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-webmodules', GSWebmodules);
        Object.seal(GSWebmodules);
    }

    async getTemplate() {
        return super.getTemplate('//views/modules.html');
    }

    async onLoad() {
        const o = {success: false};
        return o.success ? o.data : false;
    }
}