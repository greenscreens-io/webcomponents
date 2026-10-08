/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSSystem class
 * @module dialogs/GSSystem
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSSingleSignOn extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-sso', GSSingleSignOn);
        Object.seal(GSSingleSignOn);
    }

    onReady() {
        super.onReady();
		const me = this;
        if (me.large) me.large();
    }

    get dialogTemplate() {
        return '//dialogs/sso.html';
    }

    get dialogTitle() {
        return 'Single Sign-on';
    }
    
    get spn() {
		return this.query('#spn');
	}

    async onSPN() {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.spnList();
		if (!o.success) return;
		this.spn.apply(o.data)
    }
    
    async onFormInit(form) {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.load();
        super.onFormInit(form, o.data);
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.save(data);
        super.onData();
        return o.success;
    }

	async onDialogReloadKerberos() {
        const o = DEMO ? DEMO : await io.greenscreens.Kerberos.reload();
        return o.success;
	}
    
}