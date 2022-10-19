/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSScheduler class
 * @module views/GSScheduler
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSScheduler extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-scheduler', GSScheduler);
        Object.seal(GSScheduler);
    }

    async getTemplate() {
        return super.getTemplate('//views/schedulers.html');
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        filter.type = filter.type ? parseInt(filter.type, 10) : 0;
        filter.status = filter.status ? parseInt(filter.status, 10) : 0;
        const o = DEMO ? DEMO : await io.greenscreens.Scheduler.list(me.store.page - 1, me.store.limit, filter.type, filter.status);
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

    async run(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.Scheduler.runNow(data.id);
        me.inform(o.success, 'Task started!');
        me.refresh();
    }

}