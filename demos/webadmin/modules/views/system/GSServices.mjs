/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSWorkstations class
 * @module views/GSWorkstations
 */

export class GSWorkstations extends BaseViewUI {

    static {
        this.define('gs-admin-view-services');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/services.html";
    }  

    async onLoad() {
        const o = DEMO ? DEMO : await io.greenscreens.Tweaks.list();
        return o.data;
    }

}