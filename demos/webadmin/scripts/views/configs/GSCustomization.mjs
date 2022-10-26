/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCustomization class
 * @module views/GSCustomization
 */
 import Utils from '../../utils/Utils.mjs';
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
        return this.query('#header');
    }

    get footer() {
        return this.query('#footer');
    }

    get ui() {
        return this.query('#ui');
    }
}