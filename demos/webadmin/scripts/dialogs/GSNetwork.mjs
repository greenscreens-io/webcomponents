/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSNetwork class
 * @module dialogs/GSNetwork
 */
 import GSModal from '../../../../modules/components/GSModal.mjs';

export default class GSNetwork extends GSModal {

    static {
        customElements.define('gs-admin-dialog-network', GSNetwork);
        Object.seal(GSNetwork);
    }

    constructor() {
        super();
        this.visible = true;
    }
    
}