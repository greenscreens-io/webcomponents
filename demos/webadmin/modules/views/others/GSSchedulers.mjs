/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { Utils } from '../../utils/Utils.mjs';
import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSScheduler class
 * @module views/GSScheduler
 */
export class GSScheduler extends BaseViewUI {

    #mapState = { "": 0, "true": 1, "false": 2 };

    static {
        this.define('gs-admin-view-scheduler');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/schedulers.html";
    }    

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const type = filter.type ? parseInt(filter.type, 10) : null;
        const status = me.#mapState[filter.status] || 0;
        const o = DEMO ? DEMO : await io.greenscreens.Scheduler.list(me.store.skip, me.store.limit, type, status);
        return o.data;
    }

    async onCreate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Scheduler.save(data);
        return o.success;
    }

    async onUpdate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Scheduler.save(data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Scheduler.remove(data.id);
        return o.success;
    }

    async onViewRun(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.Scheduler.runNow(data.id);
        Utils.inform(o.success, 'Task started!');
        me.onViewRefresh();
    }

}