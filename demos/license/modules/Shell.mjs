/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import { GSElement } from '../../../modules/GSElement.mjs';
import { GSDOM } from '../../../modules/base/GSDOM.mjs';
import { GSEvents } from '../../../modules/base/GSEvents.mjs';
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