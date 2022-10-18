/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSWorkstations class
 * @module views/GSWorkstations
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSWorkstations extends BaseViewUI {

    #terminals = [];

    static {
        customElements.define('gs-admin-view-workstations', GSWorkstations);
        Object.seal(GSWorkstations);
    }

    async getTemplate() {
        return super.getTemplate('//views/workstations.html');
    }

    onReady() {
        super.onReady();
        const me = this;
        me.table.on('selected', me.#onSelected.bind(me));
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = await io.greenscreens.Manage.listSessions(me.store.page - 1, me.store.limit, filter);
        return o.success ? o.data : me.inform(o.success, o.msg);
    }

    async messageByFilter(e) {
        const me = this;
        const msg = prompt('Enter message to send');
        const isMsg = msg?.trim().length > 0;
        if (!isMsg) return;
        const data = me.filter;
        data.message = msg;
        const o = io.greenscreens.Manage.sendMessage(data);
        me.inform(o.success, o.success ? 'Message sent' : ` Error sending message: "${o.msg}"`);
    }

    async killByFilter(e) {
        const me = this;
        const filter = me.filter;
        const o = await io.greenscreens.Manage.killSessions(filter);
        me.inform(o.success, o.success ? 'Devices killed!' : o.msg);
        if (o.success) me.refresh();
        return true;
    }

    async message(e) {
        const me = this;
        const data = e.detail.data[0];
        const msg = prompt('Enter message to send');
        const isMsg = msg?.trim().length > 0;
        if (!isMsg) return;
        data.message = msg;
        const o = io.greenscreens.Manage.sendMessage(data.sessionID, data.deviceID, msg);
        me.inform(o.success, o.success ? 'Message sent' : ` Error sending message: "${o.msg}"`);
    }

    async kill(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = await io.greenscreens.Manage.killDevice(data);
        me.inform(o.success, o.success ? 'Device killed!' : o.msg);
        if (o.success) me.refresh();
    }

    async logging(e) {
        const me = this;
        const data = e.detail.data[0];
        const o = await io.greenscreens.Manage.loging(data);
        if (!o.success) return me.inform(o.success, o.msg);

        if (o.msg === 'false') {
            const url = location.origin + '/services/logs?id=' + o.code;
            globalThis.open(url);
        }
    }

    #onSelected(e) {
        if (!e.detail.evt?.shiftKey) return;
        const data = e.detail.data[0];
        this.onScreen(data);
    }

    onScreen(data) {

        const me = this;

        let win = me.#terminals[data?.deviceID];
        if (win && !win.closed) return;

        win = globalThis.open(location.origin + '/terminal/?d=0&k=0', '', 'target=blank,width=800,height=600,scrollbasrs=no,toolbar=no,titlebar=yes');
        win.onclose = () => delete me.terminal[data.deviceID];
        win.focus();

        const id = setInterval(() => {
            if (!win.Tn5250) return;
            me.#terminals[data.deviceID] = win;
            win.document.title = 'Terminal - ' + data.uuid + ' - ' + data.host + ' - ' + data.display;
            clearInterval(id);

            win.Tn5250.Keyboard.listen('command', (e, cfg, code, name) =>  {
                if (name === 'PF5') me.updateScreen(win, data);
            });
            me.updateScreen(win, data);
        }, 1000);

    }

    async updateScreen(win, data) {
        const o = io.greenscreens.Manage.getScreen(data.sessionID, data.deviceID);
        if (o.success) win.Tn5250.Application.test(win.Tn5250.Binary.fromHex(o.msg));
    }
}