/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { Utils } from '../utils/Utils.mjs';

/**
 * A module initializing Quark Engine for login actions
 * @module shell
 */

/**
 * Class representing Login Quark controller
 * @class
 * @extends {GSElement}
 */
export class LoginController {

	static #headers = { 'x-type': 'admin' };
	static #cred = { uuid: 'ADMIN', host: 'ADMIN', user: 'ADMIN' };
	static #api = `${location.origin}/services/api?q=/rpc`;
	static #svc = `${location.origin}/services/rpc`;

	#host = null;
	#engine = null;

	constructor(host) {
		const me = this;
		me.#host = host;
		me.#host.addController(me);
	}

	hostConnected() {
	}
	
	hostDisconnected() {
		delete globalThis.io;
		const me = this;
		me.#host = null;
		me.#engine?.stop();
		me.#engine = null;
	}
	
	// called only once, before host.firstUpdate
	hostUpdated() {
		this.#init();
	}	

	get isSimple() {
		return Tn5250.opt.auth === 1;
	}

	async login(data) {
		if (globalThis.DEMO) return true;
		const cred = this.isSimple ? Object.assign(data, LoginController.#cred) : data;
		const ret = await io.greenscreens.AdminController.login(cred);
		const success = Utils.handleResponse(ret);
		return success;
	}

	async #init() {
		if (globalThis.DEMO) return true;
		const me = this;
		const ref = LoginController;
		me.#engine = await QuarkEngine.init({ api: ref.#api, service: ref.#svc, headers: ref.#headers });
		me.#engine.Generator.on('error', e => console.log(e));		
	}
}
