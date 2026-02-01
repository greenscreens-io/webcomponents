/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSTunnel class
 * @module dialogs/GSTunnel
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSTunnel extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-tunnel', GSTunnel);
        Object.seal(GSTunnel);
    }

    onReady() {
        super.onReady();
        const me = this;
        me.large();
        me.attachEvent(me, 'change', me.#onChange.bind(me));
    }

    get dialogTemplate() {
        return '//forms/tunnel.html';
    }

    get dialogTitle() {
        return 'Network Tunnel';
    }

    get typeField() {
        return this.query('select[name=type]');
    }

    get unixField() {
        return this.query('select[name=unix]');
    }

    #onChange(e) {
        const me = this;
        if (e.target.name === 'type') {
            const type = me.typeField.value;
            switch (type) {
                case '0': //SOCK5
                case '3': //INTERNAL
                    me.unixField.selectedIndex = 0;
                    me.unixField.options[1].disabled = true;
                    break;
                default:
                    me.unixField.options[1].disabled = false;
                    me.unixField.disabled = false;
                    break;          
            }
        }        
    }   

}