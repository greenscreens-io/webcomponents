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

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = await io.greenscreens.ApiKeys.list(me.store.page - 1, me.store.limit, filter);
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    async onCreate(data) {
        const me = this;
        const o = await io.greenscreens.ApiKeys.add(data);
        me.inform(o.success, o.success ? 'Data created!' : o.msg);
        if (o.success) me.refresh();
    }

    async onUpdate(data) {
        const me = this;
        const o = await io.greenscreens.ApiKeys.update(data);
        me.inform(o.success, o.success ? 'Data updated!' : o.msg);
        if (o.success) me.refresh();
    }

    async onRemove(data) {
        const me = this;
        const o = await io.greenscreens.ApiKeys.remove(data.id);
        me.inform(o.success, o.success ? 'Data removed!' : o.msg);
        if (o.success) me.refresh();
    }
    
    async toggle(e) {
        const me = this;
        const data = e.detail.data[0];
        data.active = !(data.active == 'true');
        const o = await io.greenscreens.ApiKeys.update(data.id, data);
        me.inform(o.success, o.success ? 'Status changed!' : o.msg);
        if (o.success) me.refresh();    
    }
 
}