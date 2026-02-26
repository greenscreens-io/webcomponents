/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

import { BaseViewUI } from '../BaseViewUI.mjs';

/**
 * A module loading GSConfiguration class
 * @module views/GSConfiguration
 */
export default class GSConfiguration extends BaseViewUI {

    static {
        this.define('gs-admin-view-configuration');
    }

    constructor() {
        super();
        const me = this;
        me.template = "//views/configurations.html";
    }

    firstUpdated(changed) {
        super.firstUpdated(changed);
        const me = this;

        // If license installer not available; remove activator
        if (!me.#hasInstaller) {
            me.menu?.query('[data-action="activate"]', true)?.remove();
        }
    }

    get #hasInstaller() {
        return globalThis.Tn5250?.opt?.lic === true;
    }

    get activateDialog() {
        return this.query('#modal-activate', true);
    }

    get printerReset() {
        return this.query('#modal-reset', true);
    }

    get printerSetup() {
        return this.query('#modal-setup', true);
    }

    get validate() {
        return this.query('#modal-validate', true);
    }

    get menu() {
        return this.query('gs-context');
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

    onViewResetPrinter(e) {
        const me = this;
        const data = me.store.selected.pop();
        me.printerReset.open(data);
    }

    onViewSetupPrinter(e) {
        const me = this;
        const data = me.store.selected.pop();
        me.printerSetup.open(data);
    }

    onViewActivate(e) {
        const me = this;
        const data = me.store.selected.pop();
        me.activateDialog.open(data);
    }

    async onViewValidateServer(e) {
        const me = this;
        me.waiter.open();
        try {
            const data = me.store.selected.pop();
            const o = DEMO ? DEMO : await io.greenscreens.Hosts.validate(data);
            me.validate.confirm('Validate', o.msg);
        } finally {
            me.waiter.close();
        }
    }
}