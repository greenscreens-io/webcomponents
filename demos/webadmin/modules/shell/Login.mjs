/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading Login class
 * @module dialogs/Login
 */
import {GSAttr,GSDOM,GSUtil} from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

import GSAsbtractDialog from '../dialogs/GSAsbtractDialog.mjs';
import Utils from '../utils/Utils.mjs';
import WebAuthn from '../utils/WebAuthn.mjs';

globalThis.Tn5250 = {
    version: '6.0.0.300',
    build: '25.07.2023.',
    release: 20230725, 
    opt : {
        lic : true
    }
};

export default class Login extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-shell-login', Login);
        Object.seal(Login);
    }

    static #headers = { 'x-type': 'admin' };
    static #cred = { uuid: 'ADMIN', host: 'ADMIN', user: 'ADMIN' };
    static #api1 = `${location.origin}/services/api?q=/rpc`;
    static #svc1 = `${location.origin}/services/rpc`;

    static #api2 = `${location.origin}/services/api?q=/wsadmin`;
    static #svc2 = `${location.origin}/services/wsadmin`.replace('http', 'ws');

    static #auth = `${location.origin}/services/auth`;

    #engine = null;

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        //me.visible = true;
        me.cancelable = false;
        me.align = 'center';
        me.cssTitle = 'd-flex justify-content-center w-100';
    }

    get dialogTemplate() {
        return '//shell/login.html';
    }

    get dialogTitle() {
        const url = globalThis.GSC?.logoUrl || '../assets/img/logo.png';
        return `<img src="${url}" alt="..." height="30" width="180">`; // 'Admin Login';
    }

    get #otp() {
        return this.query('input[name="otp"]');
    }

    get #password() {
        return this.query('input[name="password"]');
    }

    async onOpen() {

        console.clear();

        const me = this;
        me.#initDemo();
        Utils.unsetUI('gs-admin-shell');

        if (DEMO) return me.#toggle(false);

        await GSUtil.timeout(5);
        await me.#initAuth();

        me.#engine = await me.#engineLogin();

        me.#doWebAuth();

        //return true;
    }

    async onData(data) {
        const me = this;

        if (globalThis.DEMO) {
            me.#shell();
            return true;
        }

        try {
            me.#toggle(true);
            const cred = Object.assign(data, Login.#cred);
            await io.greenscreens.AdminController.login(cred);
        } catch (e) {
            me.onOpen();
            throw e;
        }

        me.#postLogin();
    }

    async #doWebAuth() {
        const me = this;
        if (!me.#isWebauth) return;
        const data = { appID: 0, ipAddress: Tn5250.opt.ip };
        const cred = Object.assign(data, Login.#cred);
        try {
            const o = await WebAuthn.authenticate(cred);
            if (o.success) document.cookie = 'X-Authorization=' + o.srl + '; path=/services/wsadmin';
            me.#postLogin();
        } catch (e) {
            Utils.handleError(e);
            if (me.#webauthOnly) location.reload();
        }
    }

    async #postLogin() {

        console.clear();
        const me = this;

        me.#engine?.stop();
        me.#engine = await me.#engineShell();

        me.#engine.SocketChannel.on('offline', (e) => {
            console.log('Socket channel closed!');
            Utils.handleError(e);
            me.#engine?.stop();
            location.reload();
        });

        me.#shell();
        return true;
    }

    get #isWebauth() {
        return Tn5250?.opt?.fido;
    }

    get #isOtp() {
        return Tn5250?.opt?.otp;
    }

    get #webauthOnly() {
        return this.#isWebauth && !this.#isOtp;
    }

    #initDemo() {
        //if (globalThis.hasOwnProperty('DEMO')) return;
        if ('DEMO' in globalThis) return;
        globalThis.DEMO = typeof Engine !== 'function';
    }

    #toggle(sts = false) {
        GSDOM.queryAll(this, 'input, button').forEach(el => GSAttr.toggle(el, 'disabled', sts));
        GSDOM.query(this, 'input').focus();
    }

    async #initAuth() {
        delete globalThis.io;
        const res = await fetch(Login.#auth);
        if (!res.ok) return false;
        const opt = globalThis.Tn5250.opt = await res.json();
        globalThis.Tn5250.opt = opt;
        const me = this;
        GSAttr.toggle(me.#otp, 'disabled', !opt.otp);
        GSAttr.toggle(me.#password, 'disabled', !opt.otp);
        GSDOM.toggleClass(me.#otp, 'd-none', !opt.otp);
        if (me.#webauthOnly) {
            me.closable = false;
            me.body.parentElement.innerHTML = '<div class="m-3 text-center fs-5">Use security key to access Web Admin console.</div>';
        }
    }

    async #engineLogin() {
        return this.#getEngine(Login.#api1, Login.#svc1);
    }

    async #engineShell() {
        return this.#getEngine(Login.#api2, Login.#svc2);
    }

    async #getEngine(api, svc) {
        delete globalThis.io;
        this.#engine = null;
        return Engine.init({ api: api, service: svc, headers: Login.#headers });
    }

    #shell() {
        this.#clear();
        Utils.setUI('gs-admin-shell');
    }

    #clear() {
        Utils.unsetUI('gs-admin-shell-login');
        Utils.unsetUI('gs-admin-shell');
    }

}