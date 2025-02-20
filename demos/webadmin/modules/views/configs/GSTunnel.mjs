/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { Utils } from '../../utils/Utils.mjs';
import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSConfiguration class
 * @module views/GSConfiguration
 */

export class GSTunnel extends BaseViewUI {

    static {
        this.define('gs-admin-view-tunnel');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/tunnel.html";
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.list(me.store.skip, me.store.limit, filter);
        return o.data;
    }

    async onCreate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.save(data);
        return o.success;
    }

    async onClone(data) {
        delete data.id;
        data.name = `${data.name} - ${Date.now()}`;
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.save(data);
        return o.success;
    }

    async onUpdate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.save(data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.remove(data.id);
        return o.success;
    }

    async onViewSstart(e) {
        const data = this.store.selected.pop();
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.start(data.id);
        Utils.inform(o.success, 'Tunnel started');
    }

    async onViewStop(e) {
        const data = this.store.selected.pop();
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.stop(data.id);
        Utils.inform(o.success, 'Tunnel stopped');
    }

    async onViewRestart(e) {
        const data = this.store.selected.pop();
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.restart(data.id);
        Utils.inform(o.success, 'Tunnel restarted');
    }

    async onViewDownload(e) {
        const data = this.store.selected.pop();
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.download(data.id);

        const conf = [
            'auto: true',
            'mode: cloud',
            'cloud: ' + location.origin,
            'token: ' + o.code,
            'tls: 1',
            'tlsVerify: true'
        ];
        Utils.download(data.name + '.bin', Utils.fromHex(o.msg));
        Utils.download('server.config', conf.join('\n'));
    }
}