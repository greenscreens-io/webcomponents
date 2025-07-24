/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { GSDOM, GSAttr } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

import { PassKeyController } from './PassKeyController.mjs';

import '../utils/Tn5250.mjs';
/**
 * Class loading server auth flags and updates UI based on flags 
 * 
 * @class
 * @extends {GSElement}
 */
export class AuthController {

	static #auth = `${location.origin}/services/auth`;

	#host = null;
	#init = false;

	constructor(host) {
		const me = this;
		me.#host = host;
		me.#host.addController(me);
	}

	hostConnected() {
		const me = this;
		me.#initialize();
	}
	
	hostDisconnected() {
		const me = this;
		me.#init = false;
		me.#host = null;
	}
	
	// called only once, before host.firstUpdate
	hostUpdate() {
		const me = this;
		if (Tn5250.opt) {
			me.#toggleUser();
			me.#toggleOtp();
			me.#togglePassword();
			me.#toggleWebAuthn();			
		}
	}

	get isAny() {
		return Tn5250.opt.auth === 0;
	}
	
	get isSimple() {
		return Tn5250.opt.auth === 1;
	}

	get isSSO() {
		return Tn5250.opt.auth === 2;
	}

	get isIBM() {
		return Tn5250.opt.auth === 3;
	}

	get isBypass() {
		return Tn5250?.opt?.bypass;
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
	
	get ssoOnly() {
		return this.isSSO && !this.isWebauth && !this.isOtp;
	}

	async #initialize() {
		const me = this;
		me.#host.toggle(false);
		if (globalThis.DEMO) {
			globalThis.Tn5250.opt = { auth : 1, otp : false, fido : false, bypass : true};
			me.#init = true;
		} else {
			const res = await fetch(AuthController.#auth);
			if (res.ok) {
				globalThis.Tn5250.opt = await res.json();
				me.#init = true;
			}
		}
		me.#host.toggle(me.#init);
		me.#notify();
		return me.#init;
	}
	
	#notify() {
		if (this.#init) return;
		const n = GSDOM.query('gs-notification');
		n?.danger('', 'Engine not initialized!');		
	}

	#toggleWebAuthn() {
		const me = this;
		if (me.webauthOnly) {
			me.#host.closable = false;
			me.#host.body.parentElement.innerHTML = '<div class="m-3 text-center fs-5">Use security key to access Web Admin console.</div>';
		} else if (me.ssoOnly) {
			me.#host.body.innerHTML = '<div class="m-3 text-center fs-5">Use Kerberos (SSO) to access Web Admin console.</div>';
		}		
		if (me.isWebauth) new PassKeyController(me.#host);
	}
	
	#toggleUser() {
		this.#toggleInput(this.#user, this.isIBM);
	}

	#toggleOtp() {
		this.#toggleInput(this.#otp, this.isOtp);
	}

	#togglePassword() {
		const me = this;
		me.#toggleInput(me.#password, (me.isAny || me.isSimple || me.isIBM));
	}

	#toggleInput(el, sts = false) {
		GSAttr.toggle(el, 'disabled', !sts);
		GSDOM.toggleClass(el, 'd-none', !sts);
	}

	get #otp() {
		return this.#host?.otp;
	}

	get #password() {
		return this.#host?.password;
	}

	get #user() {
		return this.#host?.user;
	}
}
