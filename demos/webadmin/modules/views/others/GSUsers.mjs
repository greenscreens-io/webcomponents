/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../../utils/Utils.mjs';
import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSUsers class
 * @module views/GSUsers
 */
export class GSUsers extends BaseViewUI {

    static {
        this.define('gs-admin-view-users');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/users.html";
    }    

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.Users.list(me.store.skip, me.store.limit, filter);
        return o.data;
    }

    async onCreate(data) {
        this.#prepare(data);
        const o = DEMO ? DEMO : await io.greenscreens.Users.save(data);
        return o.success;
    }

    async onUpdate(data) {
        this.#prepare(data);
        const o = DEMO ? DEMO : await io.greenscreens.Users.save(data);
        return o.success;
    }

    async onClone(data) {
        delete data.id;
        const o = DEMO ? DEMO : await io.greenscreens.Users.save(data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Users.remove(data.id);
        return o.success;
    }

    async onViewCommit(e) {
        const me = this;
        me.waiter.open()
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Users.commit();
            Utils.inform(o.success, 'Sync with database ok!');
        } finally {
            me.waiter.close();
        }
    }

    async onViewResync(e) {
        const me = this;
        me.waiter.open()
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Users.resync();
            Utils.inform(o.success, 'Sync from storage started!');
        } finally {
            me.waiter.close();
        }
    }


    #prepare(json) {
        json.confid = parseInt(json.confid || 0);
        json.devtype = parseInt(json.devtype || 0);
        json.driver = parseInt(json.driver || 0);
        json.drawer1 = parseInt(json.drawer1 || -1);
        json.drawer2 = parseInt(json.drawer2 || -1);
        json.enhanced = parseInt(json.enhanced || 0);
        json.uuid = (json.uuid || '').toUpperCase();
        json.host = (json.host || '').toUpperCase();
        json.user = (json.user || '').toUpperCase();
        json.display = (json.display || '').toUpperCase();
        json.outq = (json.outq || '').toUpperCase();
        json.program = (json.program || '').toUpperCase();
        json.printer = (json.printer || 'Default');
    }

}