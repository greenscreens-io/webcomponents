/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading FormTunnel class
 * @module dialogs/FormTunnel
 */
 
import GSAttr from '../../../modules/base/GSAttr.mjs';
import GSModal from '../../../modules/components/GSModal.mjs';

export default class FormTunnel extends GSModal {

    static {
        customElements.define('gs-admin-form-tunnel', FormTunnel);
        Object.seal(FormTunnel);
    }

    get nameField() {
        return GSDOM.query(this, 'input[name="name"]');
    }

    onReady() {
        super.onReady();
        const me = this;
        me.on('visible', me.#onVisible.bind(me));
    }

    #onVisible(e) {
        const me = this;
        const sts = me.nameField?.value?.trim().length > 0;
        GSAttr.toggle(me.nameField, 'readonly', sts);
        GSAttr.toggle(me.nameField, 'disabled', sts);
    }
}