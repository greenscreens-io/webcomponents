/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCustomization class
 * @module views/GSCustomization
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSCustomization extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-customization', GSCustomization);
        Object.seal(GSCustomization);
    }

    async getTemplate() {
        return super.getTemplate('//views/customizations.html');
    }

    async onLoad() {
        const me = this;
        const o = await io.greenscreens.Scripts.getScripts();
        if (!o.success) return  me.inform(o.success, o.msg);

        me.header.value = o.data.header;
        me.footer.value = o.data.footer;
        me.ui.value = o.data.ui;
    }

    async save() {
        console.log('==> Save changes');
    }

    get header() {
        return this.query('#header');
    }

    get footer() {
        return this.query('#footer');
    }

    get ui() {
        return this.query('#ui');
    }
}