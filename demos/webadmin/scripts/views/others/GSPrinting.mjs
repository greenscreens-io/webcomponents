/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSPrinting class
 * @module views/GSPrinting
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSPrinting extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-printing', GSPrinting);
        Object.seal(GSPrinting);
    }

    async getTemplate() {
        return super.getTemplate('//views/printing.html');
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.Printers.list(me.store.page-1, me.store.limit, filter);
        return o.data;
    }

    async onCreate(data) {
        this.#prepare(data);
        const o = DEMO ? DEMO : await io.greenscreens.Printers.set(data);
        return o.success;
    }

    async onUpdate(data) {
        this.#prepare(data);
        const o = DEMO ? DEMO : await io.greenscreens.Printers.set(data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Printers.remove(data.id);
        return o.success;
    }

    #prepare(json) {
        json.uuid = json.uuid.toUpperCase();
        json.host = json.host.toUpperCase();
        json.outq = (json.outq || '').toUpperCase();
        json.library = (json.library || '').toUpperCase();
        json.userName = (json.userName || '').toUpperCase();
        json.spoolName = (json.spoolName || '').toUpperCase();
    }
}