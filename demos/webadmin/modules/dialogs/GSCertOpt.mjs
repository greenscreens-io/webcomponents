/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { GSLoader } from '../../../../modules/base/GSLoader.mjs';
import { GSAsbtractDialog } from './GSAsbtractDialog.mjs';

/**
 * A module loading GSCertOpt class
 * @module dialogs/GSCertOpt
 */
export class GSCertOpt extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-certopt');
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.dismissable = true;
        me.size = "large";
        me.title = "Certificate Options";
        me.template = "//dialogs/certificates-options.html";
    }

    async onData(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Certificate.saveConfig(data);
        return o.success;
    }    

    async loadDefaults() {
        let data = null;
        if(DEMO)  {
            data = await GSLoader.loadSafe('./data/cert.json', 'GET', null, true);            
        } else {
            data = await io.greenscreens.Certificate.loadConfig();
            data = data.data;
        }
        return data;
    } 
    
}