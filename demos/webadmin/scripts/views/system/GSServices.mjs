/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
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
        const o = DEMO ? DEMO : await io.greenscreens.Tweaks.list();
        return o.data;
    }

}