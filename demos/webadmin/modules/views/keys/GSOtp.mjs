
/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSOtp class
 * @module views/GSOtp
 */
import Utils from '../../utils/Utils.mjs';
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
        const o = DEMO ? DEMO : await io.greenscreens.OAuth.list(me.store.page - 1, me.store.limit, filter);
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

    toggle(e) {
        const data = e.detail.data[0];
        if (!data) return Utils.inform(false, 'Record not selected!');
        data.active = !data.active;
        const me = this;
        me.onUpdate(data);
        me.refresh();
    }
}