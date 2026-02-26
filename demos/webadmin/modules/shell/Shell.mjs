/*
 * Copyright (C) 2015, 2026 Green Screens Ltd.
 */
import { GSEvents } from '../../../../modules/base/GSEvents.mjs';
import { GSElement } from '../../../../modules/GSElement.mjs';
import { Utils } from '../utils/Utils.mjs';
import { ShellController } from '../controllers/ShellController.mjs';

/*
 * Class handling application UI
 */
class Shell extends GSElement {

    #controller = null;

    constructor() {
        super();
        const me = this;
        me.template = "//shell.html";
    }


	hostConnected() {
        super.hostConnected();
        const me = this;
        me.#controller = new ShellController(me);
	}
	
	hostDisconnected() {
        super.hostDisconnected();
        this.#controller = null;    
    }

    firstUpdated() {
        super.firstUpdated();
        const me = this;
        me.controller = new ShellController(me);
        GSEvents.monitorAction(me);
    }

    async onLogout(e) {
        await Utils.clear();
        Utils.setUI('gs-admin-shell-login');	
    }

    onExplorer(e) {
        debugger;
    }

    onDownloadConfig(e) {
        debugger;
    }

    onDownloadLogs(e) {
        debugger;
    }

    onCertGenTerm() {
        debugger;
    }

    onCertGenTsp() {
        debugger;
    }
    
    onCertGenSvr() {
        debugger;
    }

    onCertGenReq() {
        debugger;
    }
    
    onCertExport() {
        debugger;
    }

    onCertClientVerify() {
        debugger;
    }    

    onCertServerRefresh() {
        debugger;
    }

    static {
        this.define('gs-admin-shell');
    }
}