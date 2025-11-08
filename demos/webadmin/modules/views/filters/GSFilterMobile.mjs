/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSFilterMobile class
 * @module views/GSFilterMobile
 */
import Utils from "../../utils/Utils.mjs";
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
            Utils.inform(true, 'Mobile monitoring changed!');
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async getTemplate() {
        return super.getTemplate('//views/filter-mobile.html');
    }

    async onLoad(e) {
        const me = this;
        const filter = me.filter;
		if (e?.detail?.source?.shiftKey) await io.greenscreens.Mobile.reload();
        const o = DEMO ? DEMO : await io.greenscreens.Mobile.list(me.store.skip, me.store.limit, filter);
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

    async onViewUpload() {
        const data = await Utils.upload('aplication/json');
        const o = DEMO ? DEMO : await io.greenscreens.Mobile.import(data);
        return o.success;
    }

    async onViewDownload() {
        const o = DEMO ? DEMO : await io.greenscreens.Mobile.export();
        Utils.download('filter.nobile.json', o.data, 'aplication/json');
        return o.success;
    }     
}