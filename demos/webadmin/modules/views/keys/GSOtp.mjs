
/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

import { Utils } from '../../utils/Utils.mjs';
import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSOtp class
 * @module views/GSOtp
 */
export class GSOtp extends BaseViewUI {

    static {
        this.define('gs-admin-view-otp');
    }

    constructor() {
        super();
        const me = this;
        me.size = "large";
        me.template = "//views/keys-otp.html";
    }    

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.OAuth.list(me.store.skip, me.store.limit, filter);
        return o.data;
    }

    async onUpdate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.OAuth.update(data.id, data.active);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.OAuth.remove(data.id);
        return o.success;
    }

    onViewToggle(e) {
        const data = e.detail.data[0];
        if (!data) return Utils.inform(false, 'Record not selected!');
        data.active = !data.active;
        const me = this;
        me.onUpdate(data);
        me.onViewRefresh();
    }
}