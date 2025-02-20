/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSEvents, GSDOM, GSElement } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";
import { RestController } from './helpers/RestController.mjs';

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
        const me = this;
        await RestController.logout();
        me.login.opened = true;
        me.hide = true;
        me.login.reset();
    }

    get login() {
        return GSDOM.query(document.body, 'gs-dialog-login');
    }

    static {
        this.define('gs-shell');
    }
}