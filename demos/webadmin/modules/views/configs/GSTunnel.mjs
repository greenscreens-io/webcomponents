/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSConfiguration class
 * @module views/GSConfiguration
 */
import BaseViewUI from '../BaseViewUI.mjs';
import Utils from "../../utils/Utils.mjs";

export default class GSTunnel extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-tunnel', GSTunnel);
        Object.seal(GSTunnel);
    }

    async getTemplate() {
        return super.getTemplate('//views/tunnel.html');
    }

    async onLoad(e) {
        const me = this;
        if (e?.detail?.source?.shiftKey) await io.greenscreens.Tunnel.reload();
        const o = DEMO ? DEMO : await io.greenscreens.Tunnel.list(me.store.page - 1, me.store.limit);
        return o.data;
    }

    async onCreate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Tunnel.save(data);
        return o.success;
    }

    async onClone(data) {
        delete data.id;
        data.name = `${data.name} - ${Date.now()}`;
        const o = DEMO ? DEMO : await io.greenscreens.Tunnel.save(data);
        return o.success;
    }

    async onUpdate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Tunnel.save(data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Tunnel.remove(data.id);
        return o.success;
    }

    async onViewStart(e) {
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.Tunnel.start(data.id);
        Utils.inform(o.success, 'Tunnel started');
    }

    async onViewStop(e) {
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.Tunnel.stop(data.id);
        Utils.inform(o.success, 'Tunnel stopped');
    }

    async onViewRestart(e) {
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.Tunnel.restart(data.id);
        Utils.inform(o.success, 'Tunnel restarted');
    }


}