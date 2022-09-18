/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSSystem class
 * @module dialogs/GSSystem
 */
 import GSDialog from './GSDialog.mjs';

export default class GSSystem extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-system', GSSystem);
        Object.seal(GSSystem);
    }
    
    onReady() {
        super.onReady();
        this.large();
    }

    get dialogTemplate() {
        return '//dialogs/system.html';
    }
    
    get dialogTitle() {
        return 'System Options';
    }
}