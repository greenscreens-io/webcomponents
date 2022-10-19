/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading Login class
 * @module dialogs/Login
 */
import GSAttr from '../../../../modules/base/GSAttr.mjs';
import GSDOM from '../../../../modules/base/GSDOM.mjs';
import GSDialog from '../dialogs/GSDialog.mjs';
import Utils from '../Utils.mjs';

globalThis.Tn5250 = {
	version: '6.0.0.300',
    build: '15.10.2022.',
    release: 20221015
};

export default class Login extends GSDialog {

    static {
        customElements.define('gs-admin-shell-login', Login);
        Object.seal(Login);
    }

    static #cred = {uuid:'ADMIN', host: 'ADMIN', user:'ADMIN'};
    static #api1 = `${location.origin}/services/api?q=/rpc`;
    static #svc1 = `${location.origin}/services/rpc`;

    static #api2 = `${location.origin}/services/api?q=/wsadmin`;
    static #svc2 = `${location.origin}/services/wsadmin`.replace('http','ws');

    static #auth = `${location.origin}/services/auth`;

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.visible = true;
        me.cancelable = false;
        me.align = 'center';
        me.cssTitle = 'd-flex justify-content-center w-100';
    }

    get dialogTemplate() {
        return '//shell/login.html';
    }

    get dialogTitle() {
        return '<img src="../assets/img/logo.png" alt="..." height="30" width="180">'; // 'Admin Login';
    }

    async onOpen() {
        console.clear();
        const me = this;
        if (!globalThis.hasOwnProperty('DEMO')) globalThis.DEMO = false;
        Utils.unsetUI('gs-admin-shell');
        if (DEMO) return me.#toggle(false);
        setTimeout(async () => {
            me.#initAuth();
            await me.#engineLogin();
            // TODO hide/show OTP field; request WebAuth if available
            me.#toggle(false);
        }, 5);
        return true;
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
        } catch(e) {
            me.onOpen();
            throw e;
        }

        console.clear();

        const engine = await me.#engineShell();

        engine.SocketChannel.on('offline', (e) => {
            console.log('Socket channel closed!');
            console.log(e);
            me.#login();
        });

        me.#shell();
        return true;
    }
    
    #toggle(sts = false) {
        GSDOM.queryAll(this, 'input, button').forEach(el => GSAttr.toggle(el, 'disabled', sts));
        GSDOM.query(this, 'input').focus();
    }

    async #initAuth() {
        delete globalThis.io;
        const res = await fetch(Login.#auth);
        if (!res.ok) return false;       
        globalThis.Tn5250.opt = await res.json();
    }

    async #engineLogin() {
        delete globalThis.io;
        return Engine.init({api: Login.#api1, service: Login.#svc1});
    }

    async #engineShell() {
        delete globalThis.io;
        return Engine.init({api: Login.#api2, service: Login.#svc2});
    }

    #login() {
        this.#clear();
        Utils.setUI('gs-admin-shell-login');
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