/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSCertBlocked class
 * @module dialogs/GSCertBlocked
 */
 import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSCertBlocked extends GSModal {

    static {
        customElements.define('gs-admin-dialog-certblocked', GSCertBlocked);
        Object.seal(GSCertBlocked);
    }

    constructor() {
        super();
        this.visible = true;
    }
}