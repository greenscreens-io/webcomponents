/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSBiometrics class
 * @module views/GSBiometrics
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSBiometrics extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-biometrics', GSBiometrics);
        Object.seal(GSBiometrics);
    }

    async getTemplate() {
        return super.getTemplate('//views/keys-bio.html');
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = await io.greenscreens.WebAuth.list(me.store.page - 1, me.store.limit, filter);
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    async onRemove(data) {
        const me = this;
        const o = await io.greenscreens.WebAuth.remove(data);
        me.inform(o.success, o.success ? 'Data removed!' : o.msg);
        if (o.success) me.refresh();
    }
    
}