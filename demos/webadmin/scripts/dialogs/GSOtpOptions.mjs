/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSOtpOptions class
 * @module dialogs/GSOtpOptions
 */
 import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSOtpOptions extends GSModal {

    static {
        customElements.define('gs-admin-dialog-otpopt', GSOtpOptions);
        Object.seal(GSOtpOptions);
    }
    
    constructor() {
        super();
        this.visible = true;
    }
}