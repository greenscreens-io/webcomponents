/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSAsbtractDialog } from '../dialogs/GSAsbtractDialog.mjs';


/**
 * A module loading GSTunnel class
 * @module dialogs/GSTunnel
 */

/**
 * SSH and SOCK5 tunnel dialog
 */
export class GSTunnel extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-tunnel');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//forms/tunnel.html";
        me.title = "Network Tunnel";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Proxy.activate(data);
        return o.success;
    }

    async firstUpdated(changed) {
        super.firstUpdated(changed);
        const me = this;
        me.on('form', me.#onForm.bind(me));
        me.on('change', me.#onChange.bind(me));
    }

    afterOpen() {
        super.afterOpen();
        const me = this;
        me.#updateSecurity();
    }

    get typeField() {
        return this.query('select[name=type]', true);
    }

    get authTypeField() {
        return this.query('select[name=authType]', true);
    }

    get passwordField() {
        return this.query('input[name=password]', true);
    }

    get keyField() {
        return this.query('textarea[name=key]', true);
    }

    get securityFields() {
        return this.form.queryAll('gs-form-group', true)
            .filter(el => el.dataset.cat === 'security')
            .map(el => el.field);
    }

    #onForm(e) {
        const me = this;
        me.#updateSecurity();
    }

    #onChange(e) {
        const me = this;
        me.#updateSecurity();
    }

    #updateSecurity() {
        const me = this;
        
        const typeFld = me.typeField;
        if (typeFld.disabled) return;
       
        const enabled = typeFld.value === '3';        
        me.securityFields.forEach(fld => fld.disabled = !enabled); //INTERNAL
        if (!enabled) return;

        const authFld = me.authTypeField;
        if (authFld.disabled) return;

        const auth = authFld.value;
        switch (auth) {
            case '0': //PASSWORD
                me.passwordField.disabled = false;
                me.keyField.disabled = true;
                break;
            case '1': //KEY
                me.passwordField.disabled = true;
                me.keyField.disabled = false;
                break;
        }
    }
}