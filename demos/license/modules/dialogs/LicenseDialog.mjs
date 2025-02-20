/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSEvents, GSDialogElement } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";
import { Messages } from '../helpers/Messages.mjs';
import { RestController } from '../helpers/RestController.mjs';
/*
 * Class handling license dialog form 
 */
class LicenseDialog extends GSDialogElement {

    static properties = {
        updateable: { reflect: true, type: Boolean },
    }

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.closable = true;
        me.cancelable = true;
        me.minWidth = 400;
        me.title = "License";
        me.buttonAlign = "center";
        me.cssTitle = "fs-3 fw-bold";
        me.css = "shadow-sm rounded p-3";
        me.template = "//dialogs/license.html";
        me.on("data", me.onData.bind(me));
    }

    renderUI() {
        const me = this;
        me.confirmText = me.updateable ? "Update" : "Add";
        return super.renderUI();
    }

    async onData(e) {
        const me = this;
        const data = e.detail;
        try {
            if (me.updateable) {
                await RestController.updateLicense(data);
            } else {
                await RestController.createLicense(data);
            }
            me.reset();
            me.opened = false;
        } catch (err) {
            Messages.show(err.message);
        }
        GSEvents.prevent(e);
    }

    static {
        this.define('gs-dialog-license');
    }

}