/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSFilterIP class
 * @module views/GSFilterIP
 */
import Utils from "../../utils/Utils.mjs";
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSFilterIP extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-filterip', GSFilterIP);
        Object.seal(GSFilterIP);
    }

    async onReady() {
        super.onReady();
        const me = this;
        me.modal.large();
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Filter.isActive();
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
            const o = DEMO ? DEMO : await io.greenscreens.Filter.activity(val);
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async getTemplate() {
        return super.getTemplate('//views/filter-ip.html');
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.Filter.list(me.store.skip, me.store.limit, filter);
        return o.data;
    }

    async onCreate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Filter.set(data);
        return o.success;
    }

    async onUpdate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Filter.set(data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Filter.remove(data.id);
        return o.success;
    }
}