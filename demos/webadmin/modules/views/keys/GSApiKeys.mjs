/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../../utils/Utils.mjs';
import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSApiKeys class
 * @module views/GSApiKeys
 */

export class GSApiKeys extends BaseViewUI {

    static {
        this.define('gs-admin-view-apikeys');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/keys-api.html";
    }    
    
    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.ApiKeys.list(me.store.skip, me.store.limit, filter);
        return o.data;
    }

    async onCreate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.ApiKeys.add(data);
        return o.success;
    }

    async onUpdate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.ApiKeys.update(data.id, data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.ApiKeys.remove(data.id);
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