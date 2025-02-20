/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */
import { GSElement } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

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