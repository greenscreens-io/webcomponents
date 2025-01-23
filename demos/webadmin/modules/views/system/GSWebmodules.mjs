/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../../utils/Utils.mjs';
import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSWebmodules class
 * @module views/GSWebmodules
 */
export class GSWebmodules extends BaseViewUI {

    static {
        this.define('gs-admin-view-webmodules');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/modules.html";
    }  

    async onLoad() {
        const o = DEMO ? DEMO : await io.greenscreens.WebModules.list();
        return o.data;
    }

    async onViewStart(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.WebModules.start(data.name);
        Utils.inform(o.success, 'Module started!');
        me.onViewRefresh();
    }

    async onViewStop(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.WebModules.stop(data.name);
        Utils.inform(o.success, 'Module stopped!');
        me.onViewRefresh();
    }

    async onViewRestart(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.WebModules.restart(data.name);
        Utils.inform(o.success, 'Module restarted!');
        me.onViewRefresh();
    }
}