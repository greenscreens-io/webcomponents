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
        const o = await io.greenscreens.Printers.list(me.store.page - 1, me.store.limit, filter);
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    #prepare(data) {
        data.uuid = data.uuid.toUpperCase();
        data.host = data.host.toUpperCase();
        data.outq = (data.outq || '').toUpperCase();
        data.library = (data.library || '').toUpperCase();
        data.userName = (data.userName || '').toUpperCase();
        data.spoolName = (data.spoolName || '').toUpperCase();
        return data;
    }

    async #set(data, msg) {
        const me = this;
        data = me.#prepare(data);
        const o = await io.greenscreens.Printers.set(data);
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
        const o = await io.greenscreens.Printers.remove(data.id);
        me.inform(o.success, o.success ? 'Data removed!' : o.msg);
        if (o.success) me.refresh();
    }
        
}