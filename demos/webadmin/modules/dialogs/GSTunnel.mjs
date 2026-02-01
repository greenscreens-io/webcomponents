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

}