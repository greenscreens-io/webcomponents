/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */
import { GSEvents } from '../../../../modules/base/GSEvents.mjs';
import { GSElement } from '../../../../modules/GSElement.mjs';

/*
 * Class handling application UI
 */
class Shell extends GSElement {

    constructor() {
        super();
        const me = this;
        me.template = "//shell.html";
    }

    firstUpdated() {
        super.firstUpdated();
        GSEvents.monitorAction(this);
    }

    async onLogout(e) {
        debugger;
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