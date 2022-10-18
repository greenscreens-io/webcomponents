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

    async loadData() {
        const me = this;
        const o = await io.greenscreens.Certificate.loadConfig();
        if (!o.success) return me.inform(false, o.msg);

        o.data.alternativeNames = (o.data.alternativeNames || '');
        
        if (!o.data.commonNameServer) {
             o.data.commonNameServer = location.hostname;
        }
        
        if (o.data.alternativeNames.indexOf(location.hostname) < 0) {
            o.data.alternativeNames = o.data.alternativeNames +'\n'+ location.hostname;
        }            

        return o.data;
    }

    async onConfirm(data) {
        const me = this;
        const o = await io.greenscreens.Certificate.saveConfig(data);
        me.inform(o.success, o.success ? 'Data saved!' : o.msg);
        return o.success;
    }     

}