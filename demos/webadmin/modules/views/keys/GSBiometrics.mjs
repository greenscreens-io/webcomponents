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

    async onLoad(e) {
        const me = this;
        const filter = me.filter;
		if (e?.detail?.source?.shiftKey) await io.greenscreens.WebAuth.reload();
        const o = DEMO ? DEMO : await io.greenscreens.WebAuth.list(me.store.skip, me.store.limit, filter);
        return o.data;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.WebAuth.remove(data);
        return o.success;
    }
}