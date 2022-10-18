/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading FormService class
 * @module dialogs/FormService
 */
 
import GSAttr from '../../../modules/base/GSAttr.mjs';
import GSModal from '../../../modules/components/GSModal.mjs';

export default class FormService extends GSModal {

    #type = null;

    static {
        customElements.define('gs-admin-form-service', FormService);
        Object.seal(FormService);
    }

    get valueField() {
        return GSDOM.query(this, 'input[name="value"]');
    }

    convert(data) {
        const me = this;
        switch(me.#type) {
            case 'checkbox':
                data.value = data.value == 'true';
                break;
            case 'number':
                data.value = parseInt(data.value, 10);
                break;
        }
    }

    updateValue(value) {
        const me = this;
        me.#type = me.valueToType(value);
        GSAttr.set(me.valueField, 'type', me.#type);
        if (me.#type === 'checkbox') {
            me.valueField.className = 'form-check-input';
            me.valueField.parentElement.className = 'form-check form-switch fs-4';
            me.valueField.checked = value;
        } else {
            me.valueField.className = 'form-control';
            me.valueField.parentElement.className = '';
        }
    }

    valueToType(val) {
        const dtype = typeof val;
        const isBool = dtype === "boolean";
        const type = dtype === "string" ? "text" : "number";
        return isBool ? 'checkbox' : type;
    }
}