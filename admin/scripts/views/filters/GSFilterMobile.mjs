/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSFilterMobile class
 * @module views/GSFilterMobile
 */
import GSEvent from '../../../../modules/base/GSEvent.mjs';
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSFilterMobile extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-filtermobile', GSFilterMobile);
        Object.seal(GSFilterMobile);
    }

    get filterSwitch() {
        return this.query('select[name="filter"]');
    }

    onReady() {
        super.onReady();
        const me = this;
        me.modal.large();
        me.#updateFilterSwitch();
        GSEvent.attach(me, me.filterSwitch, 'change', me.#onFilterSwitch.bind(me));
    }

    async getTemplate() {
        return super.getTemplate('//views/filter-mobile.html');
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = await io.greenscreens.Mobile.list(me.store.page - 1, me.store.limit, filter);
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    async #updateFilterSwitch() {
        const me = this;
        const o = await io.greenscreens.Mobile.isActive();
        if (!o.success) me.inform(o.success, o.msg);
        me.filterSwitch.val = o.code;
    }

    async #onFilterSwitch(e) {
        const active = parseInt(e.target.value, 10);
        const o = await io.greenscreens.Mobile.activity(active);
        if (!o.success) me.inform(o.success, o.msg);
    }

    async #set(data, msg) {
        const me = this;
        const o = await io.greenscreens.Mobile.set(data);
        me.inform(o.success, o.success ? msg : o.msg);
        if (o.success) me.refresh();
    }

    async onCreate(data) {
        return this.#set(data, 'Data created!');
    }

    async onUpdate(data) {
        return this.#set(data, 'Data updated!');
    }

    async onRemove(data) {
        const me = this;
        const o = await io.greenscreens.Mobile.remove(data.id);
        me.inform(o.success, o.success ? 'Data removed!' : o.msg);
        if (o.success) me.refresh();
    }
    
}