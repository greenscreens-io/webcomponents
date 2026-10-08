/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSFilter class
 * @module dialogs/GSFilter
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSFilter extends GSAsbtractDialog {

    static {
        customElements.define('gs-admin-dialog-filter', GSFilter);
        Object.seal(GSFilter);
    }

    onReady() {
        super.onReady();
        const me = this;
        me.large();
    }

    get dialogTemplate() {
        return '//forms/filter-ip.html';
    }

    get dialogTitle() {
        return 'IP Filter';
    }
    
    get typeField() {
        return this.query('select[name=type]');
    }

    get valueField() {
        return this.query('input[name=value]');
    }

    open(data) {
        super.open(data);
    }
    
}