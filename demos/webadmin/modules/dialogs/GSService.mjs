/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSService class
 * @module dialogs/GSService
 */
 import { GSAttr, GSUtil } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSService extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-service', GSService);
        Object.seal(GSService);
    }

    onReady() {
        super.onReady();
        this.large();
    }

    get dialogTemplate() {
        return '//dialogs/service.html';
    }

    get dialogTitle() {
        return 'Service Module Property';
    }

    get valueField() {
        return this.query('input[name=value]');
    }

    open(data) {
        const me = this;
        me.form?.reset();
        me.valueField.type = 'text';
        me.valueField.classList.value = 'form-control';
        me.valueField.parentElement.classList.value = '';

        if (GSUtil.isNumber(data.value)) {
            me.valueField.type = 'number';
        }

        if (GSUtil.isBool(data.value)) {
			GSAttr.set(me.valueField, 'value');
            me.valueField.type = 'checkbox';
            me.valueField.classList.value = 'form-check-input';
            me.valueField.parentElement.classList.value = 'form-check form-switch fs-5';
			//me.valueField.checked = GSUtil.asBool(data.value); 
        }

        super.open(data);
    }

    async onData(data) {
        const me = this;

        const type = GSAttr.get(me.valueField, 'type');

        if (type === 'checkbox') {
            data.value = GSUtil.asBool(me.valueField?.checked);
        }

        if (type === 'number') {
            data.value = parseInt(data.value || 0) || 0;
        }

        const o = DEMO ? DEMO : await io.greenscreens.ServiceProperties.set(data.module, data.property, data.value);
		super.onData();
        return o.success;
    }

}