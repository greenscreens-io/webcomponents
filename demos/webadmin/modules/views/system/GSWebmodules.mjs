/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSWebmodules class
 * @module views/GSWebmodules
 */
import Utils from "../../utils/Utils.mjs";
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
        const o = DEMO ? DEMO : await io.greenscreens.system.WebModules.list();
        return o.data;
    }

    async onViewStart(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.system.WebModules.start(data.name);
        Utils.inform(o.success, 'Module started!');
        await me.onViewRefresh();
    }

    async onViewStop(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.system.WebModules.stop(data.name);
        Utils.inform(o.success, 'Module stopped!');
        await me.onViewRefresh();
    }

    async onViewRestart(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.system.WebModules.restart(data.name);
        Utils.inform(o.success, 'Module restarted!');
        await me.onViewRefresh();
    }
	
	async onViewOpen(e) {
		const data = e.detail.data[0];
		if (data) window.open(`${location.origin}/${data.name.slice(0, -4)}/`);
	    return true;
	}	
}