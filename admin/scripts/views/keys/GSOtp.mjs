/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSOtp class
 * @module views/GSOtp
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSOtp extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-otp', GSOtp);
        Object.seal(GSOtp);
    }

    onReady() {
        super.onReady();
        this.modal.large();
    }

    async getTemplate() {
        return super.getTemplate('//views/keys-otp.html');
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = await io.greenscreens.OAuth.list(me.store.page - 1, me.store.limit, filter);
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    async onUpdate(data) {
        return this.toggle(data);
    }

    async onRemove(data) {
        const me = this;
        const o = await io.greenscreens.OAuth.remove(data.id);
        me.inform(o.success, o.success ? 'Data removed!' : o.msg);
        if (o.success) me.refresh();
    }
    
    async toggle(data) {
        const me = this;
        data.active = !(data.active == 'true');
        const o = await io.greenscreens.OAuth.update(data.id, data.active);
        me.inform(o.success, o.success ? 'Status changed!' : o.msg);
        if (o.success) me.refresh();    
    }

       
}