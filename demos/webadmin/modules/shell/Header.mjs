/*
 * Copyright (C) 2015, 2026 Green Screens Ltd.
 */
import { GSElement } from '../../../../modules/GSElement.mjs';

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