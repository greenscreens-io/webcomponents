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
        filter.type = filter.type == '-1' ? null : parseInt(filter.type) || null;
        filter.status = parseInt(filter.status) || 0;
        const o = await io.greenscreens.Scheduler.list(me.store.page - 1, me.store.limit, filter.type, filter.status);
        return o.success ? o.data : me.inform(o.success, o.msg);
    }
        
    async #set(data, msg) {
        const me = this;
        const o = await io.greenscreens.Scheduler.save(data);
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
        const o = await io.greenscreens.Scheduler.remove(data.id);
        me.inform(o.success, o.success ? 'Data removed!' : o.msg);
        if (o.success) me.refresh();
    }

    async run(e) {
        const data = e.detail.data[0];
        const me = this;
        const o = await io.greenscreens.Scheduler.runNow(data.id);
        me.inform(o.success, o.success ? 'Task started!' : o.msg);
    }

}