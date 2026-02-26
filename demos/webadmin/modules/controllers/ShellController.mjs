/*
 * Copyright (C) 2015, 2026 Green Screens Ltd.
 */

import { Utils } from '../utils/Utils.mjs';

/**
 * Class representing Shell Quark controller
 * @class
 * @extends {GSElement}
 */
export class ShellController {

	static #headers = { 'x-type': 'admin' };
	static #api = `${location.origin}/services/api?q=/wsadmin`;
	static #svc = `${location.origin}/services/wsadmin`.replace('http', 'ws');

	#host = null;
	#engine = null;

	constructor(host) {
		const me = this;
		me.#host = host;
		me.#host.addController(me);
	}

	hostConnected() {
		const me = this;
		me.#init().catch(e => me.#setupOffline(e));
	}

	hostDisconnected() {
		delete globalThis.io;
		const me = this;
		me.#host = null;
		me.#engine?.stop();
		me.#engine = null;
	}
	
	get isKeepAlive() {
		return location.search.includes('keepalive');
	}

	get isDebug() {
		return location.search.includes('keepalive');
	}
		
	// prevent logoff
	#setupEcho() {
		const me = this;
		if (me.isDebug || me.isKeepAlive) {
			me.#engine.iid = setInterval(() => globalThis.io?.greenscreens?.Session?.echo(), 5000);
		}
	}

	async #setupOffline(e) {
		const me = this;
		console.log('Socket channel closed!', e);
		clearInterval(me.#engine?.iid);
		await Utils.clear();
		const el = await Utils.setUI('gs-admin-shell-login');
		el?.open();
	}
	
	async #init() {
		if (globalThis.DEMO) return;
		const me = this;
		const ref = ShellController;
		me.#engine = await globalThis?.QuarkEngine.init({ api: ref.#api, service: ref.#svc, headers: ref.#headers });
		me.#engine.Generator.on('error', e => console.log(e));
		me.#engine.SocketChannel.once('offline', me.#setupOffline.bind(me));
		me.#setupEcho();		
	}

}
