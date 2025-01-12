/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */
import { GSElement } from '../../../../modules/GSElement.mjs';

/*
 * Class handling application login into admin shell
 */
class Login extends GSElement {

    constructor() {
        super();
        const me = this;
        me.template = "//shell/login.html";
    }

    firstUpdated() {
        super.firstUpdated();
    }

    static {
        this.define('gs-admin-login');
    }
}