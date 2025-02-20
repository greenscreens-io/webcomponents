/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../../utils/Utils.mjs';
import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSCustomization class
 * @module views/GSCustomization
 */

export class GSCustomization extends BaseViewUI {

    static {
        this.define('gs-admin-view-customization');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/customizations.html";
    }

    async onLoad() {
        const me = this;
        const o = DEMO ? DEMO : await io.greenscreens.Scripts.getScripts();
        me.header.value = o.data?.header || '';
        me.footer.value = o.data?.footer || '';
        me.ui.value = o.data?.ui || '';
    }

    async save() {
        const me = this;
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Scripts.setScripts(me.header.value, me.footer.value, me.ui.value);
            Utils.inform(o.success, 'Data saved!');
        } catch (e) {
            Utils.handleError(e);
        }
    }

    get header() {
        return this.query('#header', true);
    }

    get footer() {
        return this.query('#footer', true);
    }

    get ui() {
        return this.query('#ui', true);
    }
}