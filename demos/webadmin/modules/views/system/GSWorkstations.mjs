/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import {  GSFunction} from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

import { Utils } from '../../utils/Utils.mjs';
import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSWorkstations class
 * @module views/GSWorkstations
 */

export class GSWorkstations extends BaseViewUI {

    static {
        this.define('gs-admin-view-workstations');        
    }

    #terminal = {};

    constructor() {
        super();
        const me = this;
        me.template = "//views/workstations.html";
    }  

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.Manage.listSessions(me.store.skip, me.store.limit, filter);
        return o.data;
    }

    async onViewMessage(e) {

        const msg = prompt('Enter message to send');
        if (!(msg?.trim().length > 0)) return;

        const me = this;
        try {
            const data = e.detail.data[0];
            data.message = msg;
            const o = DEMO ? DEMO : await io.greenscreens.Manage.sendMessage(data.sessionID, data.deviceID, data.message);
            Utils.inform(true, 'Message sent!');
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async onViewLogging(e) {
        const me = this;
        try {
            const data = e.detail.data[0];
            const o = DEMO ? DEMO : await io.greenscreens.Manage.loging(data);
            if (o.msg === 'false') {
                const url = location.origin + '/services/logs?id=' + o.code;
                Utils.download('server.log', url);
            }
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async onViewKill(e) {
        const me = this;
        try {
            const data = e.detail.data[0];
            const o = DEMO ? DEMO : await io.greenscreens.Manage.killDevice(data);
            Utils.inform(true, 'Kill signal sent!');
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async onViewMessageFilter(e) {

        const msg = prompt('Enter message to send');
        if (!(msg?.trim().length > 0)) return;

        const me = this;
        try {
            const data = Object.assign(me.filter);
            data.message = msg;
            const o = DEMO ? DEMO : await io.greenscreens.Manage.sendMessages(me.filter);
            Utils.inform(true, 'Message sent!');
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async onViewKillFilter(e) {
        const me = this;
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Manage.killSessions(me.filter);
            Utils.inform(true, 'Kill signal sent!');
        } catch (e) {
            Utils.handleError(e);
        }
    }

    async onViewExport(e) {
        const me = this;
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Manage.export(0, 0, me.filter);
            const tmp = JSON.stringify(o.data);
            Utils.download('workstations.json', tmp);
        } catch (e) {
            Utils.handleError(e);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        const me = this;
        Object.values(me.#terminal)
            .filter(el => GSFunction.isFunction(el.close))
            .forEach(el => el.close());
        me.#terminal = {};
    }

    onViewViewSession(e) {

        if (DEMO) return Utils.inform(false, 'Not available in DEMO mode.');

        const me = this;
        const data = e.detail.data[0];

        let win = me.#terminal[data.deviceID];
        if (win && !win.closed) return;

        const params = 'target=blank,width=800,height=600,scrollbasrs=no,toolbar=no,titlebar=yes';
        const url = `${location.origin}/terminal/?d=0&k=0`;
        win = Utils.openInNewTab(url, params);
        win.onclose = () => delete me.#terminal[data.deviceID];
        if (GSFunction.isFunction(win.focus)) win.focus();

        const id = setInterval(() => {

            if (!win.Tn5250) return;
            clearInterval(id);

            me.#terminal[data.deviceID] = win;
            win.document.title = `Terminal - ${data.uuid} - ${data.host} - ${data.display}`;
            me.#updateScreen(win, data);

            win.Tn5250.Keyboard.listen('command', (e, cfg, code, name) => {
                if (name === 'PF5') me.#updateScreen(win, data);
            });

        }, 1000);

    }

    async #updateScreen(win, data) {
        if (!win?.Tn5250) return;
        try {
            const o = await io.greenscreens.Manage.getScreen(data.sessionID, data.deviceID);
            win.Tn5250.Application.test(win.Tn5250.Binary.fromHex(o.msg));
        } catch (e) {
            console.log(e);
        }
    }
}