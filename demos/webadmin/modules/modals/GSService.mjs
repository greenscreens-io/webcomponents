/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSAttr } from '../../../../modules/base/GSAttr.mjs';
import { GSUtil } from '../../../../modules/base/GSUtil.mjs';
import { GSAsbtractDialog } from '../dialogs/GSAsbtractDialog.mjs';

/**
 * A module loading GSService class
 * @module dialogs/GSService
 */
export class GSService extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-service');
    }


    constructor() {
        super();
        const me = this;
        me.template = "//dialogs/service.html";
        me.title = "Service Module Property";
    }

    get valueField() {
        return this.query('input[name=value]', true);
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