/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginDefaults class
 * @module dialogs/GSLoginDefaults
 */
 import GSDialog from './GSDialog.mjs';

export default class GSLoginDefaults extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-logindefs', GSLoginDefaults);
        Object.seal(GSLoginDefaults);
    }
    
    get dialogTemplate() {
        return '//dialogs/defaults.html';
    }
    
    get dialogTitle() {
        return 'Login Defaults';
    }    
}