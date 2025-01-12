/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */
import { GSElement } from '../../../../modules/GSElement.mjs';

/*
 * Class handling application UI
 */
class Sidebar extends GSElement {

    constructor() {
        super();
        const me = this;
        me.template = "//shell/sidebar.html";
    }

    firstUpdated() {
        super.firstUpdated();
    }

    static {
        this.define('gs-admin-shell-sidebar');
    }
}