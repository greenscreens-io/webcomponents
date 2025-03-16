/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSApiKeys class
 * @module views/GSApiKeys
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSApiKeys extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-apikeys', GSApiKeys);
        Object.seal(GSApiKeys);
    }

    onReady() {
        super.onReady();
        this.modal.large();
    }

    async getTemplate() {
        return super.getTemplate('//views/keys-api.html');
    }

    async onLoad(e) {
        const me = this;
        const filter = me.filter;
		if (e?.detail?.source?.shiftKey) await io.greenscreens.ApiKeys.reload();
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

    async onViewToggle(e) {
        const data = e.detail.data[0];
        if (!data) return Utils.inform(false, 'Record not selected!');
        data.active = !data.active;
        const me = this;
        await me.onUpdate(data);
        await me.onViewRefresh();
    }
}