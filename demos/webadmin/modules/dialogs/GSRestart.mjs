/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSRestart class
 * @module dialogs/GSRestart
 */
export class GSRestart extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-restart');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.title = "Server restart";
        me.template = "//dialogs/server-restart.html";
    }

    async onData(data) {
		if (DEMO) return DEMO.success;
        let o = null;
        if (data.type == 'true') {
        	o  = await io.greenscreens.Server.restart();			
		} else {
        	o  = await io.greenscreens.Server.reload();						
		}
        return o?.success;
    }    
}