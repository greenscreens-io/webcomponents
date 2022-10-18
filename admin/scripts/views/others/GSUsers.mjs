/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSUsers class
 * @module views/GSUsers
 */
import GSDOM from '../../../../modules/base/GSDOM.mjs';
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSUsers extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-users', GSUsers);
        Object.seal(GSUsers);
    }

    get waiter() {
        GSDOM.query(document.body, '#modal-wait');
    }

    async getTemplate() {
        return super.getTemplate('//views/users.html');
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = await io.greenscreens.Users.list(me.store.page - 1, me.store.limit, filter);
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    #prepare(data) {
        data.confid = parseInt(data.confid || 0);
        data.devtype = parseInt(data.devtype || 0);
        data.driver = parseInt(data.driver || 0);
        data.drawer1 = parseInt(data.drawer1 || -1);
        data.drawer2 = parseInt(data.drawer2 || -1);
        data.enhanced = parseInt(data.enhanced || 0);
        data.uuid = (data.uuid || '').toUpperCase();
        data.host = (data.host || '').toUpperCase();
        data.user = (data.user || '').toUpperCase();
        data.display = (data.display || '').toUpperCase();
        data.outq = (data.outq || '').toUpperCase();
        data.program = (data.program || '').toUpperCase();
        data.printer = (data.printer || 'Default');    
        return data;
    }

    async #set(data, msg) {
        const me = this;
        data = me.#prepare(data);
        const o = await io.greenscreens.Users.save(data);
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
        const o = await io.greenscreens.Users.remove(data.id);
        me.inform(o.success, o.success ? 'Data removed!' : o.msg);
        if (o.success) me.refresh();
    }

    async resync() {
        const me = this;
        const o = await io.greenscreens.Users.commit();
        me.inform(o.success, o.success ? 'Data resync started!' : o.msg);
    }

    async commit() {
        const me = this;
        me.waiter.open();
        try {
            const o  = await io.greenscreens.Users.commit();
            me.inform(o.success, o.success ? 'Data commited to server!' : o.msg);
        } finally {
            me.waiter.close();
        }
    }
}