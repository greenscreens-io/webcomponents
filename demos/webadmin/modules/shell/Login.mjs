/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

/**
 * A module loading Login class
 * @module dialogs/Login
 */
import Utils from '../utils/Utils.mjs';
import GSAsbtractDialog from '../dialogs/GSAsbtractDialog.mjs';

/**
 * Login UI component
 */
export default class Login extends GSAsbtractDialog {

	static {
		customElements.define('gs-admin-shell-login', Login);
		Object.seal(Login);
	}

	#authController;
	#loginController;
	
	connectedCallback() {
		super.connectedCallback();
		const me = this;
		//me.visible = true;
		me.cancelable = false;
		me.autovalidate = false;
		me.align = 'center';
		me.cssTitle = 'd-flex justify-content-center w-100';

	}

	async onReady() {
		super.onReady();
		const me = this;
		me.removeEvent(me, 'change');
	}

	get dialogTemplate() {
		return '//shell/login.html';
	}

	get dialogTitle() {
		const url = globalThis.GSC?.logoUrl || '/assets/img/logo.png';
		return `<a href="/" tabindex="-1"><img src="${url}" alt="..." height="30" width="180"></a>`; // 'Admin Login';
	}

	async onData(data) {
		const me = this;
		try {
			me.toggle(false);
			const sts = DEMO ? true : await me.#loginController.login(data);
			if (sts) {
				await Utils.clear();
				Utils.setUI('gs-admin-shell');									
			} else {
				me.toggle(true);
			}
		} catch (e) {
			throw e;
		}
	}
	    
	get otp() {
		return this.query('input[name="otp"]');
	}

	get password() {
		return this.query('input[name="password"]');
	}

	get user() {
		return this.query('input[name="user"]');
	}
	
	focusInput() {
		this.form?.elements?.filter(el => !el.classList.contains('d-none')).shift()?.focus();
	}
			
	toggle(sts = false) {
		const me = this;
		if (sts) {			
			me.enable();
			me.form?.reset();
			me.focusInput();
		} else {
			me.disable();
		}
	}


}