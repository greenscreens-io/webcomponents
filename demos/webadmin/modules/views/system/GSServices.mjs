/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSWorkstations class
 * @module views/GSWorkstations
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSWorkstations extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-services', GSWorkstations);
        Object.seal(GSWorkstations);
    }

    async getTemplate() {
        return super.getTemplate('//views/services.html');
    }

    async onLoad() {
        const o = DEMO ? DEMO : await io.greenscreens.ServiceProperties.list();
        return o.data;
    }

}