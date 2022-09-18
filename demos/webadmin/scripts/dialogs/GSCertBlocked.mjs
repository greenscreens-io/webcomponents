/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertBlocked class
 * @module dialogs/GSCertBlocked
 */
 import GSDialog from './GSDialog.mjs';

export default class GSCertBlocked extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-certblocked', GSCertBlocked);
        Object.seal(GSCertBlocked);
    }

    get dialogTemplate() {
        return '//dialogs/blocked-certificates.html';
    }
    
    get dialogTitle() {
        return 'Blocked Certificates';
    }

}