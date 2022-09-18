/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSNetwork class
 * @module dialogs/GSNetwork
 */
 import GSDialog from './GSDialog.mjs';

export default class GSNetwork extends GSDialog {

    static {
        customElements.define('gs-admin-dialog-network', GSNetwork);
        Object.seal(GSNetwork);
    }

    get dialogTemplate() {
        return '//dialogs/network.html';
    }
    
    get dialogTitle() {
        return 'Netowrk Options';
    }
}