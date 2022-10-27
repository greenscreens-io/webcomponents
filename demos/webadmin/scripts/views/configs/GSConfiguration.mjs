/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSConfiguration class
 * @module views/GSConfiguration
 */
import GSUtil from '../../../../../modules/base/GSUtil.mjs';
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSConfiguration extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-configuration', GSConfiguration);
        Object.seal(GSConfiguration);
    }

    onReady() {
        super.onReady();
        const me = this;
        requestAnimationFrame(async () => {
            await GSUtil.timeout(1000);
            me.#update();
        });
    }

    #update() {
        const me = this;

        const ctx = me.query('gs-context');
        // If license installer available
        if (me.#hasInstaller) {
            ctx?.self?.querySelector('[data-action="license"]')?.remove();
            ctx?.self?.querySelector('[data-action="install"]')?.remove();
        } else {
            // If license installer not available; remove activator
            ctx?.self?.querySelector('[data-action="activate"]')?.remove();
        }
    }

    get #hasInstaller() {
        return Tn5250?.opt?.lic == true;
    }

    async getTemplate() {
        return super.getTemplate('//views/configurations.html');
    }

    get activateDialog() {
        return GSComponents.get('modal-activate');
    }

    get installDialog() {
        return GSComponents.get('modal-install');
    }

    get licenseDialog() {
        return GSComponents.get('modal-license');
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

    activate(e) {
        const data = e.detail.data[0];
        this.activateDialog.open(data);
    }

    install(e) {
        const data = e.detail.data[0];
        this.installDialog.open(data);
    }

    license(e) {
        const data = e.detail.data[0];
        this.licenseDialog.open(data);
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