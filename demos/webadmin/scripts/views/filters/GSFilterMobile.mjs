/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSFilterMobile class
 * @module views/GSFilterMobile
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSFilterMobile extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-filtermobile', GSFilterMobile);
        Object.seal(GSFilterMobile);
    }

    async onReady() {
        super.onReady();
        const me = this;
        me.modal.large();
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Mobile.isActive();
            me.switcher.selectedIndex = parseInt(o.code, 10);
        } finally {
            me.attachEvent(me.switcher, 'change', me.#onSwitch.bind(me));
        }
    }

    get switcher() {
        return this.query('select[name="filter"]');
    }

    async #onSwitch(e) {
        try {
            const val = parseInt(e.target.value, 10);
            const o = DEMO ? DEMO : await io.greenscreens.Mobile.activity(val);
        } catch(e) {
            console.log(e);
            this.inform(false, e.msg ||e.message);
        }
    }

    async getTemplate() {
        return super.getTemplate('//views/filter-mobile.html');
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.Mobile.list(me.store.page-1, me.store.limit, filter);
        return o.data;
    }

    async onCreate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Mobile.set(data);
        return o.success;
    }

    async onUpdate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Mobile.set(data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Mobile.remove(data.id);
        return o.success;
    }    
}