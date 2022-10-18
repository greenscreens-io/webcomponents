/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSConfiguration class
 * @module views/GSConfiguration
 */
import BaseViewUI from '../BaseViewUI.mjs';
import Utils from '../../util.mjs';

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
        const o = await io.greenscreens.Proxy.list(me.store.page - 1, me.store.limit, filter);
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    async #set(data, msg) {
        const me = this;
        if (Tn5250.opt.jvm < 16 && data.unix == "true") {
            me.inform(false, 'AF_UNIX not available in JVM < 16');
            return;
        }
        const o = await io.greenscreens.Proxy.save(data);
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
        const o = await io.greenscreens.Proxy.remove(data.id);
        me.inform(o.success, o.success ? 'Data removed!' : o.msg);
        if (o.success) me.refresh();
    }
    
    async start(e) {
        const data = e.detail.data[0];
        const me = this;
        const o = await io.greenscreens.Proxy.start(data.id);
        me.inform(o.success, o.success ? 'Tunnel started!' : o.msg);
        if (o.success) me.refresh();
    }

    async stop(e) {
        const data = e.detail.data[0];
        const me = this;
        const o = await io.greenscreens.Proxy.stop(data.id);
        me.inform(o.success, o.success ? 'Tunnel stopped!' : o.msg);
        if (o.success) me.refresh();
    }

    async restart(e) {
        const data = e.detail.data[0];
        const me = this;
        const o = await io.greenscreens.Proxy.restart(data.id);
        me.inform(o.success, o.success ? 'Tunnel restarted!' : o.msg);
        if (o.success) me.refresh();
    }

    async download(e) {
        const data = e.detail.data[0];
        const me = this;
        const o = await io.greenscreens.Proxy.download(data.id);        
        if (!o.success) return me.inform(o.success, o.msg);

        const conf = [
            'auto: true',
            'mode: cloud', 
            'cloud: ' + location.origin, 
            'token: ' + o.data.code,
            'tls: 1',
            'tlsVerify: true'
            ];
        Utils.download(data.name + '.bin', Utils.fromHex(o.data.msg));
        Utils.download('server.config', conf.join('\n'));        
    }
}