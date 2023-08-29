/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSService class
 * @module dialogs/GSService
 */
import {GSAttr,GSUtil} from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
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
            me.valueField.type = 'checkbox';
            me.valueField.classList.value = 'form-check-input';
            me.valueField.parentElement.classList.value = 'form-check form-switch fs-5';
        }

        super.open(data);
    }

    async onData(data) {
        const me = this;

        const type = GSAttr.get(me.valueField, 'type');

        if (type === 'checkbox') {
            data.value = me.valueField.checked === true;
        }

        if (type === 'number') {
            data.value = parseInt(data.value || 0) || 0;
        }

        const o = DEMO ? DEMO : await io.greenscreens.Tweaks.set(data.module, data.property, data.value);

        return o.success;
    }

}