/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertOpt class
 * @module dialogs/GSCertOpt
 */
import GSDialog from './GSDialog.mjs';

export default class GSCertOpt extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-certopt', GSCertOpt);
        Object.seal(GSCertOpt);
    }

    onReady() {
        super.onReady();
        this.large();
    }

    get dialogTemplate() {
        return '//dialogs/certificates-options.html';
    }
    
    get dialogTitle() {
        return 'Certificate Options';
    }

}