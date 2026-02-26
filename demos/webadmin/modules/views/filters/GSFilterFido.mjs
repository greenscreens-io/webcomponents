/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { Utils } from '../../utils/Utils.mjs';
import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSFilterFido class
 * @module views/GSFilterFido
 */

export class GSFilterFido extends BaseViewUI {

    static {
        this.define('gs-admin-view-filter-fido');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/filter-fido.html";
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
            const o = DEMO ? DEMO : await io.greenscreens.Fido.isActive();
            me.switcher.selectedIndex = parseInt(o.code, 10);
        } finally {
            me.attachEvent(me.switcher, 'change', me.#onSwitch.bind(me));
        }        
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
        const o = DEMO ? DEMO : await io.greenscreens.Fido.list(me.store.skip, me.store.limit, filter);
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

    async onViewUpload() {
        const data = await Utils.upload('aplication/json');
        const o = DEMO ? DEMO : await io.greenscreens.Fido.import(data);
        return o.success;
    }

    async onViewDownload() {
        const o = DEMO ? DEMO : await io.greenscreens.Fido.export();
        Utils.download('filter.fido.json', o.data, 'aplication/json');
        return o.success;
    }     
}