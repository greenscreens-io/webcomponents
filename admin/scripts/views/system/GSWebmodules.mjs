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
        const o = await io.greenscreens.WebModules.list();
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    async start(e) {
        const data = e.detail.data[0];
        const o = await io.greenscreens.WebModules.start(data.name);
        this.inform(o.success, o.success ? 'Module started!' : o.msg);
    }

    async stop(e) {
        const data = e.detail.data[0];
        const o = await io.greenscreens.WebModules.stop(data.name);
        this.inform(o.success, o.success ? 'Module stopped!' : o.msg);
    }

    async restart(e) {
        const data = e.detail.data[0];
        const o = await io.greenscreens.WebModules.restart(data.name);
        this.inform(o.success, o.success ? 'Module restarted!' : o.msg);
    }
}