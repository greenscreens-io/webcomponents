/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
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
        me.cancelable = true;
        me.rounded = true;
        me.bordered = true;
        me.shadow = true;
        me.minWidth = 300;
        me.title = "Admin user";
        me.confirmText = "Update";
        me.buttonAlign = "center";
        me.cssTitle = "fs-3 fw-bold";
        me.css = "shadow-sm rounded p-3";
        me.template = "//dialogs/admin.html";
        me.on("data", me.onData.bind(me));
    }

    async onData(e) {
        const me = this;
        const data = e.detail;
        try {
            if (data.password !== data.password2) {
                throw new Error('Password does not match!');
            }
            await RestController.login(data);
            me.reset();
            me.opened = false;
        } catch (err) {
            Messages.show(err.message);
        }
        GSEvents.prevent(e);
    }

    static {
        this.define('gs-dialog-admin');
    }
}