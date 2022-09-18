/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSLoginAdmin class
 * @module dialogs/GSLoginAdmin
 */
import GSDialog from './GSDialog.mjs';

export default class GSLoginAdmin extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-loginadm', GSLoginAdmin);
        Object.seal(GSLoginAdmin);
    }
    
    get dialogTemplate() {
        return '//dialogs/login.html';
    }
    
    get dialogTitle() {
        return 'Admin Login';
    }
   
}