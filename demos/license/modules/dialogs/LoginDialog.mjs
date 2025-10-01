/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import { GSDOM } from '../../../../modules/base/GSDOM.mjs';
import { GSEvents } from '../../../../modules/base/GSEvents.mjs';
import { GSDialogElement } from '../../../../modules/components/Dialog.mjs';
import { RestController } from '../helpers/RestController.mjs';
import { Messages } from '../helpers/Messages.mjs';

/*
 * Class handling login dialog form 
 */
class LoginDialog extends GSDialogElement {

    constructor() {
        super();
        const me = this;
        me.opened = true;
        me.closable = true;
        me.title = "Login";
        me.confirmText = "Continue";
        me.buttonAlign = "center";
        me.cssTitle = "fs-3 fw-bold";
        me.css = "shadow-sm rounded p-3";
        me.template = "//dialogs/login.html";
        me.on("data", me.onData.bind(me));
    }

    async onData(e) {
        const me = this;
        const data = e.detail;
        try {
            await RestController.login(data);
            me.reset();
            me.opened = false;
            me.shell.hide = false;
        } catch (err) {
            Messages.show(err.message);
        }
        GSEvents.prevent(e);
    }

    get shell() {
        return GSDOM.query(document.body, 'gs-shell');
    }

    static {
        this.define('gs-dialog-login');
    }
}