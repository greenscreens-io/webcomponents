/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */
import { GSElement } from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

/*
 * Class handling application UI
 */
class Header extends GSElement {

    constructor() {
        super();
        const me = this;
        me.template = "//shell/header.html";
    }

    firstUpdated() {
        super.firstUpdated();
    }

    static {
        this.define('gs-admin-shell-header');
    }
}
