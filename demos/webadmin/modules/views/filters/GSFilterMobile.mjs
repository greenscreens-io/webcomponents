/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../../utils/Utils.mjs';
import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSFilterMobile class
 * @module views/GSFilterMobile
 */
export class GSFilterMobile extends BaseViewUI {

    static {
        this.define('gs-admin-view-filter-mobile');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/filter-mobile.html";
    }

	templateInjected() {
		super.templateInjected();
        this.#init();
    }

    get switcher() {
        return this.query('select[name="filter"]', true);
    }

    async #init(e) {
        const me = this;
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Mobile.isActive();
            me.switcher.selectedIndex = parseInt(o.code, 10);
        } finally {
            me.attachEvent(me.switcher, 'change', me.#onSwitch.bind(me));
        }
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

    async onLoad() {
        const me = this;
        const filter = me.filter;
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
}