/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSConfiguration class
 * @module views/GSConfiguration
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSConfiguration extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-configuration', GSConfiguration);
        Object.seal(GSConfiguration);
    }

    async getTemplate() {
        return super.getTemplate('//views/configurations.html');
    }

    get printerReset() {
        return GSComponents.get('modal-reset');
    }

    get printerSetup() {
        return GSComponents.get('modal-setup');
    }

    get validate() {
        return GSComponents.get('modal-validate');
    }

    async onLoad(e) {
        const o = DEMO ? DEMO : await io.greenscreens.Hosts.list(false);
        return o.data;
    }

    async onCreate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Hosts.setHost(data);
        return o.success;
    }

    async onUpdate(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Hosts.setHost(data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Hosts.unsetHost(data);
        return o.success;
    }

    async onClone(data) {
        const o = DEMO ? DEMO : await io.greenscreens.Hosts.cloneConfig(data);
        return o.success;
    }
        
    resetPrinter(e) {
        const data = e.detail.data[0];
        this.printerReset.open(data);
    }
    
    setupPrinter(e) {
        const data = e.detail.data[0];
        this.printerSetup.open(data);
    }
    
    async validateServer(e) {
        const me = this;
        me.waiter.open();
        try {
            const data = e.detail.data[0];
            const o = DEMO ? DEMO : await io.greenscreens.Hosts.validate(data);
            const body = `<pre>${o.msg}</pre>`;
            me.validate.confirm('Validate', body);
        } finally {
            me.waiter.close();
        }
    }
}