/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSFilterFido class
 * @module views/GSFilterFido
 */
import Utils from '../../Utils.mjs';
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSFilterFido extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-filterfido', GSFilterFido);
        Object.seal(GSFilterFido);
    }

    async getTemplate() {
        return super.getTemplate('//views/filter-fido.html');
    }

    async onReady() {
        super.onReady();
        const me = this;
        me.modal.large();
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Fido.isActive();
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
            const o = DEMO ? DEMO : await io.greenscreens.Fido.activity(val);
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.Fido.list(me.store.page - 1, me.store.limit, filter);
        return o.data;
    }

    async onCreate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Fido.set(data);
        return o.success;
    }

    async onUpdate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Fido.set(data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Fido.remove(data.id);
        return o.success;
    }
}