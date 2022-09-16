/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertOpt class
 * @module dialogs/GSCertOpt
 */
 import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSCertOpt extends GSModal {

    static {
        customElements.define('gs-admin-dialog-certopt', GSCertOpt);
        Object.seal(GSCertOpt);
    }


    constructor() {
        super();
        this.visible = true;
    }    
}