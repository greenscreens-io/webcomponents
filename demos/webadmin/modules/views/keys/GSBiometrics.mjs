/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSBiometrics class
 * @module views/GSBiometrics
 */
export class GSBiometrics extends BaseViewUI {

    static {
        this.define('gs-admin-view-biometrics');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/keys-bio.html";
    }    

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.WebAuth.list(me.store.skip, me.store.limit, filter);
        return o.data;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.WebAuth.remove(data);
        return o.success;
    }
}