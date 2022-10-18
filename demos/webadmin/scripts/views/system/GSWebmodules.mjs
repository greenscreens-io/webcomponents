/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSWebmodules class
 * @module views/GSWebmodules
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSWebmodules extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-webmodules', GSWebmodules);
        Object.seal(GSWebmodules);
    }

    async getTemplate() {
        return super.getTemplate('//views/modules.html');
    }

    async onLoad() {
        const me = this;
        const o = DEMO ? DEMO : await io.greenscreens.WebModules.list();
        if (!o.success) return me.inform(o.success, o.msg);
        return o.data;
    }

    async start(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.WebModules.start(data.name);
        me.inform(o.success, 'Module started!');
        me.refresh();
    }

    async stop(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.WebModules.stop(data.name);
        me.inform(o.success, 'Module stopped!');
        me.refresh();
    }

    async restart(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : io.greenscreens.WebModules.restart(data.name);
        me.inform(o.success, 'Module restarted!');
        me.refresh();
    }
}