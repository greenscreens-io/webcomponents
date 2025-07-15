/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

/**
 * A module loading Login class
 * @module dialogs/Login
 */
import { Utils } from '../utils/Utils.mjs';
import { GSAsbtractDialog } from '../dialogs/GSAsbtractDialog.mjs';
import { AuthController } from '../controllers/AuthController.mjs';
import { LoginController } from '../controllers/LoginController.mjs';

/**
 * Login UI component
 */
export class Login extends GSAsbtractDialog {

	static {
		this.define('gs-admin-shell-login', Login);
	}

	#authController;
	#loginController;
	
    constructor() {
        super();
        const me = this;
		me.escapable = false;
		me.cancelable = false;
		me.opened = true;
		me.bordered = true;
		me.shadow = true;
		me.align = 'center';
		me.buttonAlign = 'center';		
		me.template =  '//shell/login.html';
		me.cssTitle = 'd-flex justify-content-center w-100';
		//me.style = "--gs-backdrop-blur:0px;--gs-backdrop-display:none";
	}	
	
	firstUpdated() {
		super.firstUpdated();
		const me = this;
		me.on('form', me.onForm.bind(me));
		me.#authController = new AuthController(me);
		me.#loginController = new LoginController(me);
	}

	onForm(e) {
		this.requestUpdate();
	}

	async onData(data) {
		const me = this;
		try {
			me.toggle(false);
			const sts = await me.#loginController.login(data);
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
		return this.#findField('otp');
	}

	get password() {
		return this.#findField('password');
	}

	get user() {
		return this.#findField('user');
	}

	#findField(name) {
		return this.form?.fields?.filter(f => f.name === name).pop();
	}
			
	toggle(sts = false) {
		const me = this;
		if (sts) {			
			me.disabled = false;
			me.form?.enable(true);
			me.form?.reset();
			me.form?.elements[0]?.focus();
		} else {
			me.disabled = true;
			me.form?.disable(true);
		}
	}


}