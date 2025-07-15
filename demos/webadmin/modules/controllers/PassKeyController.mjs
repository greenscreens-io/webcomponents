/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { Utils } from '../utils/Utils.mjs';
import { WebAuthn } from '../utils/WebAuthn.mjs';

/**
 * Class for handling PassKey login  
 * 
 */
export class PassKeyController {

	static #cred = { uuid: 'ADMIN', host: 'ADMIN', user: 'ADMIN' };

	#host = null;

	constructor(host) {
		const me = this;
		me.#host = host;
		me.#host.addController(me);
	}

	hostConnected() {

	}

	hostDisconnected() {
		const me = this;
		me.#host = null;
	}

	// called only once, before host.firstUpdate
	hostUpdated() {
		this.#doWebAuth();
	}

	get isWebauth() {
		return Tn5250?.opt?.fido;
	}

	get isOtp() {
		return Tn5250?.opt?.otp;
	}

	get webauthOnly() {
		return this.isWebauth && !this.isOtp;
	}
		
	get isSecure() {
		return ['https:', 'wss:'].indexOf(location.protocol) > -1;
	} 
		
	#setCookie(name, value) {
		const cookie = this.isSecure ? '; SameSite=None; Secure' : '; SameSite=Lax';
		document.cookie = `${name}=${value}${cookie}`;		
	}	
	
	async #doWebAuth() {
		const me = this;
		if (!me.isWebauth) return;
		const data = { appID: 0, ipAddress: Tn5250.opt.ip };
		const cred = Object.assign(data, PassKeyController.#cred);
		try {
			const o = await WebAuthn.authenticate(cred);			
			if (o.success) {
				me.#setCookie('X-Authorization', `${o.srl}; path=/services/wsadmin`);
				await Utils.clear();
				await Utils.setUI('gs-admin-shell');
			} 
		} catch (e) {
			Utils.handleError(e);
			alert(`${e.name} : ${e.message}`);
			if (!me.webauthOnly) return;
			//e.name === 'NotAllowedError'
			// e.name === 'QuarkError'
			if (e.name === 'QuarkError') {				
				location.reload();
			} else {
				location.href = location.origin;
			}
		}
	}		
}
