/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSConfiguration class
 * @module views/GSConfiguration
 */
import BaseViewUI from '../BaseViewUI.mjs';
import Utils from '../../utils/Utils.mjs';

export default class GSTunnel extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-tunnel', GSTunnel);
        Object.seal(GSTunnel);
    }

    async getTemplate() {
        return super.getTemplate('//views/tunnel.html');
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.list(me.store.page, me.store.limit, filter);
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

    async start(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.start(data.id);
        Utils.inform(o.success, 'Tunnel started');
    }

    async stop(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.stop(data.id);
        Utils.inform(o.success, 'Tunnel stopped');
    }

    async restart(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.restart(data.id);
        Utils.inform(o.success, 'Tunnel restarted');
    }

    async download(e) {
        const me = this;
        const data = e.detail.data[0];
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