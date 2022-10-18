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
        const me = this;
        const o = await io.greenscreens.Tweaks.list();
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    async onUpdate(data) {
        const me = this;
        me.modal.convert(data);
        const o = await io.greenscreens.Tweaks.set(data.module, data.property, data.value);
        if (!o.success) return me.inform(o.success, o.msg);
        me.refresh();
    }

    async details(e) {
        const me = this;
        const data = e.detail.data[0];
        me.modal.updateValue(data.value);
        return super.details(e);
    }
}